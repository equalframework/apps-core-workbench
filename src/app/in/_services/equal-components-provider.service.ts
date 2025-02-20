import { Injectable, Component } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';
import { API_ENDPOINTS } from '../_models/api-endpoints';
@Injectable({
    providedIn: 'root'
})
export class EqualComponentsProviderService {
    private equalComponentsSubject = new BehaviorSubject<EqualComponentDescriptor[]>([]);
    private componentsMapFromPackage = new Map<string, Map<string, EqualComponentDescriptor[]>>();
    public equalComponents$ = this.equalComponentsSubject.asObservable();

    constructor(private api: ApiService) {
        this.preloadComponents();
    }





    /**
     * Retrieves a specific component based on the cache or via the API.
     *
     * @param package_name   - The package name.
     * @param component_type - The component type.
     * @param class_name     - Filter for the model (for some types, e.g., 'view').
     * @param component_name - The exact name of the component to search for.
     * @returns An Observable containing the EqualComponentDescriptor of the component or null if not found.
     */
    public getComponent(
        package_name: string,
        component_type: string,
        class_name: string,
        component_name: string
    ): Observable<EqualComponentDescriptor | null> {
        // Check the cache using the map
        const package_cache = this.componentsMapFromPackage.get(package_name);
        if (package_cache) {
            let components_to_search: EqualComponentDescriptor[];
            if (component_type === '') {
                components_to_search = Array.from(package_cache.values()).flat();
            } else {
                components_to_search = package_cache.get(component_type) || [];
            }
            const found_component = components_to_search.find(comp => {
                const matches_class_name = class_name ? comp.item.model.startsWith(class_name) : true;
                const matches_component_name = comp.name === component_name;
                return matches_class_name && matches_component_name;
            });
            if (found_component) {
                return of(found_component);
            }
        }

        // If not found in the cache, retrieve via the API
        return this.fetchComponents(package_name, component_type, class_name).pipe(
            map(components => {
                console.log("Components retrieved:", components);
                return components.find(comp => comp.name === component_name) || null;
            }),
            catchError(response => {
                console.error(`Error fetching specific ${component_type} for ${package_name}:`, response);
                return of(null);
            })
        );
    }


    /**
     * Retrieves components of a package based on the type and an optional class name filter.
     *
     * @param package_name   - The package name.
     * @param component_type - The component type ('class', 'controller', 'view', 'menu', 'route').
     * @param class_name     - (Optional) Filter for the model.
     * @returns An Observable containing an array of EqualComponentDescriptor.
     */
    public getComponents(
        package_name: string,
        component_type: string,
        class_name?: string
    ): Observable<EqualComponentDescriptor[]> {
        // Attempt to get the cache for this package
        const package_cache = this.componentsMapFromPackage.get(package_name);

        if (package_cache && package_cache.has(component_type)) {
            return of(package_cache.get(component_type)!);
        }


        // If not found in cache, retrieve via the API
        return this.fetchComponents(package_name, component_type, class_name).pipe(
            map(new_components => {
                if (!this.componentsMapFromPackage.has(package_name)) {
                    this.componentsMapFromPackage.set(package_name, new Map<string, EqualComponentDescriptor[]>());
                }
                return new_components;
            }),
            catchError(response => {
                console.error(`Error fetching ${component_type}s for ${package_name}:`, response);
                return of([]);
            })
        );
    }


    /**
    * Private method that retrieves components via the API based on the type and an optional filter.
    *
    * @param packageName - The package name.
    * @param componentType - The component type ('class', 'controller', 'view', 'menu', 'route').
    * @param className     - (Optional) Filter for the model name (for some types like 'view').
    * @returns An Observable containing an array of EqualComponentDescriptor.
    */
    private fetchComponents(
        package_name: string,
        component_type: string,
        class_name?: string
    ): Observable<EqualComponentDescriptor[]> {
        switch (component_type) {
            case 'class':
                return this.fetchAndFormatClasses(package_name, class_name);
            case 'controller':
                return this.fetchAndFormatControllers(package_name);
            case 'view':
                return this.fetchAndFormatViews(package_name, class_name);
            case 'menu':
                return this.fetchAndFormatMenus(package_name);
            case 'route':
                return package_name !== ''
                    ? this.fetchAndFormatRoutes(package_name)
                    : this.fetchAndFormatRoutesLives();
            default:
                return of([]);
        }
    }


    /**
    * Reloads components for a specific component type.
    * @param package_name? the name of the package if it doesn't exist it refresh all component type from all package
    * @param component_type The type of component to refresh (e.g., "controllers", "views", "menus", "routes", or "classes").
    */
    public reloadComponents(package_name?: string, component_type?: string): void {
        this.collectAllPackages()
        .pipe(take(1))
        .subscribe({
            next: (packages: EqualComponentDescriptor[]) => {
                console.log(
                `Reloading components. Provided package: ${package_name ? package_name : 'all'}, component type: ${component_type ? component_type : 'all'}. Packages loaded:`,
                packages
                );

                // If a package is specified, filter the packages accordingly.
                let filtered_packages: EqualComponentDescriptor[] = packages;
                if (package_name) {
                        filtered_packages = packages.filter(pkg => pkg.name === package_name);
                }
                if (filtered_packages.length === 0) {
                console.warn(`No package found with name "${package_name}".`);
                return;
                }

                if(component_type){
                    let componentTypes : string[] = [component_type];
                    this.preloadComponentsForPackages(filtered_packages, componentTypes);
                }else{
                    this.preloadComponentsForPackages(filtered_packages);
                }
    },
    error: (response) => {
      console.error("Error reloading packages:", response);
    }
  });
}







    /**
     * Handles fetching and mapping live routes.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable of an array of EqualComponentDescriptor representing live routes.
     */
    private fetchAndFormatRoutesLives(): Observable<EqualComponentDescriptor[]> {
        return this.collectRoutesLives().pipe(
            map((routesData) => {
                const components: EqualComponentDescriptor[] = [];

                for (const routePath of Object.keys(routesData)) {
                    const item: { [method: string]: { description: string, operation: string } } = {};
                    let packageName;

                    for (const method of Object.keys(routesData[routePath]["methods"])) {
                        const operation = routesData[routePath]["methods"][method]["operation"];

                        // Extract package name after "?something="
                        const packageMatch = operation.match(/\?[^=]+=([^\\&]+)/);
                        packageName = packageMatch ? packageMatch[1].split("\\").shift() : undefined;
                        packageName = packageName.split("_")[0];

                        item[method] = {
                            description: routesData[routePath]["methods"][method]["description"],
                            operation: routesData[routePath]["methods"][method]["operation"]
                        };
                    }

                    const file = `${packageName}/init/routes/${routesData[routePath]["info"]["file"]}`;

                    const component = new EqualComponentDescriptor(
                        packageName,
                        routePath,
                        "route",
                        file,
                        item
                    );

                    components.push(component);
                }

                return components;
            })
        );
    }

    /**
     * Handles fetching and mapping routes for a given package.
     *
     * @param {string} packageName - The name of the package.
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable of an array of EqualComponentDescriptor representing package routes.
     */
    private fetchAndFormatRoutes(packageName: string): Observable<EqualComponentDescriptor[]> {
        return this.collectRoutesFromPackage(packageName).pipe(
            map((routesData) => {
                const components: EqualComponentDescriptor[] = [];

                // Iterate over files containing routes
                for (const file in routesData) {
                    const routePath = `${packageName}/init/routes/${file}`;

                    // Iterate over route names
                    for (const routeName in routesData[file]) {
                        let item: any = {};

                        // Iterate over methods (GET, POST, PUT, etc.)
                        for (const method in routesData[file][routeName]) {
                            const routeInfo = routesData[file][routeName][method];

                            item[method] = {
                                description: routeInfo.description,
                                operation: routeInfo.operation
                            };
                        }

                        const component = new EqualComponentDescriptor(
                            packageName,
                            routeName,
                            "route",
                            routePath,
                            item
                        );

                        components.push(component);
                    }
                }

                return components;
            })
        );
    }

    /**
     * Handles fetching and mapping class components.
     *
     * @param {string} packageName - The name of the package.
     * @param {string} [className] - Optional filter for class names.
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable of an array of EqualComponentDescriptor representing classes.
     */
    private fetchAndFormatClasses(packageName: string, className?: string): Observable<EqualComponentDescriptor[]> {
        return this.collectAllClasses().pipe(
            map((classes: any) =>
                this.mapClassesToDescriptors(
                    { name: packageName } as EqualComponentDescriptor,
                    classes[packageName] || []
                )
            )
        );
    }


    /**
     * Handles fetching and mapping for controllers.
     *
     * @param {string} packageName - The name of the package.
     * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
     */
    private fetchAndFormatControllers(packageName: string): Observable<EqualComponentDescriptor[]> {
        return this.collectControllersFromPackage(packageName).pipe(
        map(response => {
            const dataDescriptors = response.data.map((controllerName: string) =>
            this.buildComponentDescriptor(packageName, controllerName.replace(/\s+/g, ''), 'get', 'data', 'controller')
            );
            const actionDescriptors = response.actions.map((actionName: string) =>
            this.buildComponentDescriptor(packageName, actionName.replace(/\s+/g, ''), 'do', 'actions', 'controller')
            );
            return [...dataDescriptors, ...actionDescriptors];
        })
        );
    }

    /**
    * Handles collecting and mapping for views.
    *
    * @param {string} packageName - The name of the package.
    * @param {string} [className] - Optional filter for view names.
    * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
    */
    private fetchAndFormatViews(packageName: string, className?: string): Observable<EqualComponentDescriptor[]> {
        return this.collectViewsFromPackage(packageName).pipe(
        map((views: string[]) =>
            views
            .filter(view => view.startsWith(`${packageName}\\${className}`))
            .map(viewName => {
                // Extraction of package name and view name
                const matches = viewName.match(/^([^\\/:]+\\[^\\/:]+):([^:]+)$/);

                if (matches) {
                const matching = matches[1];
                let viewNameCleaned = viewName.split('\\').slice(1).join('\\');

                return {
                    package_name: packageName,        // "test"
                    name: viewName.split(`\\`)[1],     // "list.zaze", "list.tar", etc.
                    type: 'view',
                    file: `${packageName}/views/${viewNameCleaned}`, // Use path without extension
                    item: {
                    model: matching.split("\\")[1] // "Test" extracted from "test\Test"
                    }
                };
                } else {
                // If the match fails, handle the error or return default values
                return {
                    package_name: '',
                    name: viewName,
                    type: 'view',
                    file: `${viewName}`,
                    item: {
                    model: viewName
                    }
                };
                }
            })
        )
        );
    }

    /**
     * Handles collecting and mapping for menus.
     *
     * @param {string} packageName - The name of the package.
     * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
     */
    private fetchAndFormatMenus(packageName: string): Observable<EqualComponentDescriptor[]> {
    return this.collectMenusFromPackage(packageName).pipe(
        map((menus: string[]) =>
        menus.map((menuName: string) =>
            this.buildComponentDescriptor(packageName, menuName, 'menu', 'menus', 'menu')
        )
        )
    );
    }

    /**
     * Builds an EqualComponentDescriptor based on the provided parameters.
     *
     * @param {string} packageName - The package name.
     * @param {string} name - The name of the component.
     * @param {string} type - The type of the component (e.g., 'get', 'do', 'view', 'menu').
     * @param {string} folder - The folder where the component's file is located.
     * @param {string} item - The item type (e.g., 'controller', 'view', 'menu').
     * @returns {EqualComponentDescriptor} The constructed EqualComponentDescriptor object.
     */
    private buildComponentDescriptor(
    packageName: string,
    name: string,
    type: string,
    folder: string,
    item: string
    ): EqualComponentDescriptor {
    return {
        package_name: packageName,
        name: name,
        type: type,
        file: `${packageName}/${folder}/${name}.php`,
        item: item
    };
    }

    /**
     * Loads all available components.
     */
    private preloadComponents (): void {
    this.collectAllPackages().pipe(
        switchMap((packages: EqualComponentDescriptor[]) => {
            this.equalComponentsSubject.next(packages);
            return of(packages);
        }),
        take(1)
    ).subscribe({
        next: (packages: EqualComponentDescriptor[]) => {
            console.log('Packages loaded:', packages);

            // Update the main cache with components by package
            packages.forEach(packageComponent => {
                if (!this.componentsMapFromPackage.has(packageComponent.name)) {
                    this.componentsMapFromPackage.set(packageComponent.name, new Map<string, EqualComponentDescriptor[]>());
                }
            });

            this.preloadComponentsForPackages(packages);
            console.log("map : ", this.componentsMapFromPackage);
        },
        error: (response) => {
            console.error('Error loading components:', response);
        }
    });
    }








    /**
     * Preloads additional components (controllers, views, menus, routes, classes) based on the given types.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     * @param {string[]} componentTypes - The list of component types to preload. If empty, all types are loaded.
     */
    private preloadComponentsForPackages (packages: EqualComponentDescriptor[], componentTypes: string[] = []): void {
    const apiCalls: Observable<EqualComponentDescriptor[]>[] = [];

    // Charge les composants en fonction des types demandés
    if (componentTypes.length === 0 || componentTypes.includes("controller")) {
        apiCalls.push(...this.loadControllers(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("view")) {
        apiCalls.push(...this.loadViews(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("menu")) {
        apiCalls.push(...this.loadMenus(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("route")) {
        apiCalls.push(...this.loadRoutes(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("class")) {
        apiCalls.push(this.loadClasses(packages));
    }


    if (apiCalls.length === 0) {
        console.log("No components selected for preloading.");
        return;
    }

    forkJoin(apiCalls).subscribe({
        next: (results: EqualComponentDescriptor[][]) => {
            const allComponents = results.flat();
            console.log("all component : ", allComponents)
            if (allComponents.length > 0) {
                this.updateComponentMap(allComponents);
            }
            console.log('Preloaded additional components:', this.componentsMapFromPackage);
        },
        error: (response) => {
            console.error('Error preloading additional components:', response);
        }
    });
    }

/**
 * Updates the component map with newly loaded components, and removes stale components.
 * @param components - The components to update.
 */
private updateComponentMap(components: EqualComponentDescriptor[]): void {
    // Collect all components to be removed from the map.
    const componentsToRemove: EqualComponentDescriptor[] = [];

    components.forEach(component => {
      const package_name = component.package_name;
      const component_type = component.type;

      // Ensure the package exists in the cache.
      if (!this.componentsMapFromPackage.has(package_name)) {
        this.componentsMapFromPackage.set(package_name, new Map<string, EqualComponentDescriptor[]>());
      }

      const packageMap = this.componentsMapFromPackage.get(package_name)!;
      const currentComponents = packageMap.get(component_type) || [];

      // Check if the component is already in the list (using its name as a unique identifier).
      const exists = currentComponents.some(c => c.name === component.name);

      // If the component doesn't exist, add it.
      if (!exists) {
        currentComponents.push(component);
        packageMap.set(component_type, currentComponents);

        // Add to the list to update the subject.
        const allComponents = this.equalComponentsSubject.getValue();
        const alreadyInSubject = allComponents.some(
          c => c.package_name === package_name && c.name === component.name
        );
        if (!alreadyInSubject) {
          this.equalComponentsSubject.next([...allComponents, component]);
        }
      }

      // Identify stale components (components that need to be removed).
      // If the component is not in the current list and it should be removed, mark it for removal.
      componentsToRemove.push(...currentComponents.filter(c => !components.some(newComp => newComp.name === c.name)));
    });

    // Remove stale components from the map and the subject.
    componentsToRemove.forEach(component => {
      const packageMap = this.componentsMapFromPackage.get(component.package_name);
      if (packageMap) {
        const currentComponents = packageMap.get(component.type);
        if (currentComponents) {
          const filteredComponents = currentComponents.filter(c => c.name !== component.name);
          if (filteredComponents.length === 0) {
            packageMap.delete(component.type); // Remove the component type from the map if empty
          } else {
            packageMap.set(component.type, filteredComponents);
          }
        }
      }

      // Remove from the subject as well.
      const allComponents = this.equalComponentsSubject.getValue();
      this.equalComponentsSubject.next(allComponents.filter(c => c.name !== component.name));
    });
  }




    private loadRoutes(packages: EqualComponentDescriptor[]) {
        return packages.map((package_component) =>
            this.collectRoutesFromPackage(package_component.name).pipe(
                map((routesData) => {
                    const components: EqualComponentDescriptor[] = [];
                    //fichier contenant les routes
                    for(const file in routesData){
                        const routePath = `${package_component.name}/init/routes/${file}`;
                        //Le nom des route
                        for(const route_name in routesData[file] ){
                            let item: any = {};
                            //Les infos de chaque route (les méthods put,get,post)
                            for( const method in routesData[file][route_name]){
                                const routeInfo = routesData[file][route_name][method];
                                item[method] = {
                                    description: routeInfo.description,
                                    operation: routeInfo.operation
                                }
                            }
                            const component = new EqualComponentDescriptor
                            (package_component.name,
                                route_name,
                                "route",
                                routePath,
                                item);
                            components.push(component);
                        }
                    }
                    return components;
                }),
                catchError((response) => {
                    console.error(`Error loading routes for ${package_component.name}:`, response);
                    return of([]);
                })
            )
        );
    }


    /**
     * Loads classes for the given packages.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     */
    private loadClasses(packages: EqualComponentDescriptor[]):Observable<EqualComponentDescriptor[]> {
            return this.collectAllClasses().pipe(
                map((classes: any) => {
                    return this.associateClassesToPackages(packages, classes)
    })
            );
    }

    /**
    * Loads views for each package.
    * @param {EqualComponentDescriptor[]} packages - The list of packages.
    * @returns {Observable<EqualComponentDescriptor[]>[]} An array of observables containing view descriptors.
    */
    private loadViews(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]>[] {
        return packages.map((package_component) =>
            this.collectViewsFromPackage(package_component.name).pipe(
                map((views: string[]) => {
                    return views.map(view_name => {
                        return {
                            package_name: package_component.name,
                            name: view_name?.split('\\').pop() ?? '',
                            type: 'view',
                            file: `${package_component.name}/views/${view_name}.php`,
                            item: {
                                model: view_name?.split('\\').pop()?.split(":")[0] ?? ''
                            }
                        };
                    });
                }),
                catchError((response) => {
                    console.error(`Error loading views for ${package_component.name}:`, response);
                    return of([]);
                })
            )
        );
    }

    /**
     * Loads menus for each package.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     * @returns {Observable<EqualComponentDescriptor[]>[]} An array of observables containing menu descriptors.
     */
    private loadMenus(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]>[] {
        return packages.map((package_component) =>
            this.collectMenusFromPackage(package_component.name).pipe(
                map((menus: string[]) => {
                    return menus.map(menu_name => ({
                        package_name: package_component.name,
                        name: menu_name,
                        type: 'menu',
                        file: `${package_component.name}/menus/${menu_name}.php`,
                        item: 'menu'
                    }));
                }),
                catchError((response) => {
                    console.error(`Error loading menus for ${package_component.name}:`, response);
                    return of([]);
                })
            )
        );
    }


        /**
     * Loads controllers for each package.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     * @returns {Observable<EqualComponentDescriptor[]>[]} An array of observables containing controller descriptors.
     */
    private loadControllers(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]>[] {
        return packages.map((package_component) =>
            this.collectControllersFromPackage(package_component.name).pipe(
                map((response: any) => {
                    const controllers: EqualComponentDescriptor[] = [];

                    response.data.forEach((controller_name: string) => {
                        controllers.push({
                            package_name: package_component.name,
                            name: controller_name.replace(/\s+/g, ''), // there is a space in the data given by the api
                            type: 'get',
                            file: `${package_component.name}/data/${controller_name}.php`,
                            item: 'controller'
                        });
                    });

                    response.actions.forEach((action_name: string) => {
                        controllers.push({
                            package_name: package_component.name,
                            name: action_name.replace(/\s+/g, ''), // there is a space in the data given by the api
                            type: 'do',
                            file: `${package_component.name}/actions/${action_name}.php`,
                            item: 'controller'
                        });
                    });

                    return controllers;
                }),
                catchError((response) => {
                    console.error(`Error loading controllers for ${package_component.name}:`, response);
                    return of([]); // Returns an empty array in case of an error
                })
            )
        );
    }







    /**
    * Fetches all available classes.
    * @returns {Observable<any>} An observable containing the list of classes.
    */
    private collectAllClasses(): Observable<any> {
        const url = API_ENDPOINTS.class.collect_all;
        return from(this.api.fetch(url)).pipe(
            catchError(error => {
                console.error('Error fetching classes:', error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }

    /**
     * Fetches all available packages.
     * @returns {Observable<EqualComponentDescriptor[]>} An observable containing the list of packages.
     */
    private collectAllPackages(): Observable<EqualComponentDescriptor[]> {
        const url = API_ENDPOINTS.package.collect_all;
        return from(this.api.fetch(url)).pipe(
            map((packages: any) =>
                packages.map((package_name: any) => ({
                    name: package_name,
                    type: 'package',
                    file: package_name,
                    item: 'package'
                }))
            ),
            catchError(error => {
                console.error('Error fetching packages:', error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }

    /**
     * Fetches routes for a specific package.
     * @param {string} package_name - The package name.
     * @returns {Observable<any>} An observable containing the routes.
     */
    private collectRoutesFromPackage(package_name: string): Observable<any> {
        const url = API_ENDPOINTS.route.collect_from_package(package_name);
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching routes for ${package_name}:`, error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }


    private collectRoutesLives(): Observable<any>{
        const url = API_ENDPOINTS.route.collect_all_live;
        return from(this.api.fetch(url)).pipe(
            catchError( (error) => {
                console.warn(`Error fetching routes lives`, error);
                return of([]);
            })
        )

    }


    /**
    * Fetches controllers for a specific package.
    * @param {string} package_name - The package name.
    * @returns {Observable<{ data: string[], actions: string[] }>} An observable containing the controllers and actions.
    */
    private collectControllersFromPackage(package_name: string): Observable<{ data: string[], actions: string[] }> {
        const url = API_ENDPOINTS.controller.collect_from_package(package_name);
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching controllers for ${package_name}:`, error);
                return of({ data: [], actions: [] }); // Returns an empty object in case of an error
            })
        );
    }

    /**
    * Fetches views for a specific package.
    * @param {string} package_name - The package name.
    * @returns {Observable<string[]>} An observable containing the views.
    */
    private collectViewsFromPackage(package_name: string): Observable<string[]> {
        const url = API_ENDPOINTS.view.collect_from_package(package_name);;
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching views for ${package_name}:`, error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }

    /**
    * Fetches menus for a specific package.
    * @param {string} package_name - The package name.
    * @returns {Observable<string[]>} An observable containing the menus.
    */
    private collectMenusFromPackage(package_name: string): Observable<string[]> {
        const url = API_ENDPOINTS.menu.collect_from_package(package_name);
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching menus for ${package_name}:`, error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }


    // Méthode to associate classes with package
    private associateClassesToPackages(packages: EqualComponentDescriptor[], classes: any): EqualComponentDescriptor[] {
        const updatedComponents: EqualComponentDescriptor[] = [];

        packages.forEach((packageDescriptor) => {
            if (classes.hasOwnProperty(packageDescriptor.name)) {
                updatedComponents.push(...this.mapClassesToDescriptors(packageDescriptor, classes[packageDescriptor.name]));
            }
        });

        return updatedComponents;
    }


    private mapClassesToDescriptors(packageDescriptor: EqualComponentDescriptor, classNames: string[]): EqualComponentDescriptor[] {
        return classNames.map((class_name: string) => {
            const classBaseName = class_name?.split('/').pop() ?? '';
            return {
                package_name: packageDescriptor.name,
                name: classBaseName,
                type: 'class',
                file: `${packageDescriptor.name}/classes/${class_name.replace(/\\/g, '/')}.class.php`,
                item: 'class'
            };
        });
    }


}



