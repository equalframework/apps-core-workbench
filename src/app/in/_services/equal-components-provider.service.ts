import { Injectable, Component } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';

@Injectable({
    providedIn: 'root'
})
export class EqualComponentsProviderService {
    private equalComponentsSubject = new BehaviorSubject<EqualComponentDescriptor[]>([]);
    private componentsMapByPackage = new Map<string, Map<string, EqualComponentDescriptor[]>>();
    public equalComponents$ = this.equalComponentsSubject.asObservable();

    constructor(private api: ApiService) {
        this.loadComponents();
    }



    /**
     * Retrieves a specific component based on the given criteria.
     *
     * @param {string} packageName - The name of the package.
     * @param {string} componentType - The type of component (e.g., 'class', 'controller', 'view', 'menu', 'route').
     * @param {string} className - The class name filter (used for some types like 'view').
     * @param {string} componentName - The exact name of the component being searched for.
     * @returns {Observable<EqualComponentDescriptor | null>}
     *          An observable containing the EqualComponentDescriptor of the specific component, or null if not found.
     */
    public getComponent(
        packageName: string,
        componentType: string,
        className: string,
        componentName: string
    ): Observable<EqualComponentDescriptor | null> {

        const currentData = this.equalComponentsSubject.value;

        // Search the cache for the specific component
        const cachedComponent = currentData.find(comp =>
            comp.package_name === packageName &&
            comp.type === componentType &&
            (className ? comp.item.model.startsWith(className) : true) &&
            comp.name === componentName
        );

        if (cachedComponent) {
            console.log("Specific component retrieved from cache:", cachedComponent);
            return of(cachedComponent);
        }

        // Fetch components from API if not found in cache
        let componentObservable: Observable<EqualComponentDescriptor[]>;

        switch (componentType) {
            case 'class':
                componentObservable = this.handleClasses(packageName, className);
                break;
            case 'controller':
                componentObservable = this.handleControllers(packageName);
                break;
            case 'view':
                componentObservable = this.handleViews(packageName, className);
                break;
            case 'menu':
                componentObservable = this.handleMenus(packageName);
                break;
            case 'route':
                componentObservable = (packageName !== "")
                    ? this.handleRoutes(packageName)
                    : this.handleRoutesLives();
                break;
            default:
                return of(null);
        }

        console.log("API used to retrieve the specific component.");

        return componentObservable.pipe(
            map(components => {
                console.log("Components retrieved:", components);
                const foundComponent = components.find(comp => comp.name === componentName);
                return foundComponent || null;
            }),
            catchError(error => {
                console.error(`Error fetching specific ${componentType} for ${packageName}:`, error);
                return of(null);
            })
        );
    }


    /**
     * Retrieves components based on the given package name, component type, and an optional class name filter.
     *
     * @param {string} packageName - The name of the package.
     * @param {string} componentType - The type of component ('class', 'controller', 'view', 'menu', or 'route').
     * @param {string} [className] - Optional filter; if provided, only components whose names start with this string will be returned.
     * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
     */
    public getComponents(
        packageName: string,
        componentType: string,
        className?: string
    ): Observable<EqualComponentDescriptor[]> {

        const packageMap = this.componentsMapByPackage.get(packageName) || new Map<string, EqualComponentDescriptor[]>();
        let filteredComponents: EqualComponentDescriptor[] = [];

        if (componentType === '') {
            // If componentType is empty, retrieve all components of the package
            packageMap.forEach((components) => {
                filteredComponents.push(...components);
            });
        } else {
            // Otherwise, retrieve only the components of the specified type
            const cachedComponents = packageMap.get(componentType) || [];
            console.log("tiens voilà le cache, ", cachedComponents);
            filteredComponents = cachedComponents.filter(comp =>
                className ? comp.item.model.startsWith(className) : true
            );
        }

        if (filteredComponents.length > 0) {
            console.log('Components retrieved from cache:', filteredComponents);
            return of(filteredComponents);
        }

        // If not found in cache, fetch from API
        let componentObservable: Observable<EqualComponentDescriptor[]>;

        switch (componentType) {
            case 'class':
                componentObservable = this.handleClasses(packageName, className);
                break;
            case 'controller':
                componentObservable = this.handleControllers(packageName);
                break;
            case 'view':
                componentObservable = this.handleViews(packageName, className);
                break;
            case 'menu':
                componentObservable = this.handleMenus(packageName);
                break;
            case 'route':
                componentObservable = packageName !== ""
                    ? this.handleRoutes(packageName)
                    : this.handleRoutesLives();
                break;
            default:
                return of([]);
        }

        return componentObservable.pipe(
            map(newComponents => {
                if (!this.componentsMapByPackage.has(packageName)) {
                    this.componentsMapByPackage.set(packageName, new Map<string, EqualComponentDescriptor[]>());
                }



                const packageMap = this.componentsMapByPackage.get(packageName)!;
                const updatedComponents = [
                    ...(packageMap.get(componentType) || [])
                ];

                packageMap.set(componentType, updatedComponents);
                return newComponents;
            }),
            catchError(error => {
                console.error(`Error fetching ${componentType}s for ${packageName}:`, error);
                return of([]);
            })
        );
    }





    public refreshComponents(): void {
        console.log("refresh");
    }





    /**
     * Handles fetching and mapping live routes.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable of an array of EqualComponentDescriptor representing live routes.
     */
    private handleRoutesLives(): Observable<EqualComponentDescriptor[]> {
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
    private handleRoutes(packageName: string): Observable<EqualComponentDescriptor[]> {
        return this.collectRoutesByPackage(packageName).pipe(
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
    private handleClasses(packageName: string, className?: string): Observable<EqualComponentDescriptor[]> {
        return this.collectClasses().pipe(
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
private handleControllers(packageName: string): Observable<EqualComponentDescriptor[]> {
    return this.collectControllersByPackage(packageName).pipe(
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
  private handleViews(packageName: string, className?: string): Observable<EqualComponentDescriptor[]> {
    return this.collectViewsByPackage(packageName).pipe(
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
  private handleMenus(packageName: string): Observable<EqualComponentDescriptor[]> {
    return this.collectMenusByPackage(packageName).pipe(
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
  private loadComponents(): void {
    this.collectPackages().pipe(
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
                if (!this.componentsMapByPackage.has(packageComponent.name)) {
                    this.componentsMapByPackage.set(packageComponent.name, new Map<string, EqualComponentDescriptor[]>());
                }
            });

            this.preloadAdditionalComponents(packages);
            console.log("map : ", this.componentsMapByPackage);
        },
        error: (error) => {
            console.error('Error loading components:', error);
        }
    });
}








  /**
 * Preloads additional components (controllers, views, menus, routes, classes) based on the given types.
 * @param {EqualComponentDescriptor[]} packages - The list of packages.
 * @param {string[]} componentTypes - The list of component types to preload. If empty, all types are loaded.
 */
private preloadAdditionalComponents(packages: EqualComponentDescriptor[], componentTypes: string[] = []): void {
    const apiCalls: Observable<EqualComponentDescriptor[]>[] = [];

    // Charge les composants en fonction des types demandés
    if (componentTypes.length === 0 || componentTypes.includes("controllers")) {
        apiCalls.push(...this.loadControllers(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("views")) {
        apiCalls.push(...this.loadViews(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("menus")) {
        apiCalls.push(...this.loadMenus(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("routes")) {
        apiCalls.push(...this.loadRoutes(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("classes")) {
        apiCalls.push(this.loadClasses(packages)); 
    }
    if(componentTypes.length ==0 || componentTypes.includes("data")){
        apiCalls.push(...this.loadData(packages,'init'));
    }

    if (apiCalls.length === 0) {
        console.log("No components selected for preloading.");
        return;
    }

    forkJoin(apiCalls).subscribe({
        next: (results: EqualComponentDescriptor[][]) => {
            const allComponents = results.flat();
            if (allComponents.length > 0) {
                this.updateComponentMap(allComponents);
            }
            console.log('Preloaded additional components:', this.componentsMapByPackage);
        },
        error: (error) => {
            console.error('Error preloading additional components:', error);
        }
    });
}

/**
 * Updates the component map with newly loaded components.
 * @param {EqualComponentDescriptor[]} components - The components to update.
 */
private updateComponentMap(components: EqualComponentDescriptor[]): void {
    const updatedComponents: EqualComponentDescriptor[] = [];

    components.forEach(component => {
        const packageName = component.package_name;
        const componentType = component.type;

        if (!this.componentsMapByPackage.has(packageName)) {
            this.componentsMapByPackage.set(packageName, new Map<string, EqualComponentDescriptor[]>());
        }

        const packageMap = this.componentsMapByPackage.get(packageName)!;
        const currentComponents = packageMap.get(componentType) || [];
        packageMap.set(componentType, [...currentComponents, component]);

        updatedComponents.push(component);
    });

    this.equalComponentsSubject.next([
        ...this.equalComponentsSubject.value,
        ...updatedComponents
    ]);
}



    private loadRoutes(packages: EqualComponentDescriptor[]) {
        return packages.map((package_component) =>
            this.collectRoutesByPackage(package_component.name).pipe(
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
                catchError((error) => {
                    console.error(`Error loading routes for ${package_component.name}:`, error);
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
            return this.collectClasses().pipe(
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
            this.collectViewsByPackage(package_component.name).pipe(
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
                catchError((error) => {
                    console.error(`Error loading views for ${package_component.name}:`, error);
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
            this.collectMenusByPackage(package_component.name).pipe(
                map((menus: string[]) => {
                    return menus.map(menu_name => ({
                        package_name: package_component.name,
                        name: menu_name,
                        type: 'menu',
                        file: `${package_component.name}/menus/${menu_name}.php`,
                        item: 'menu'
                    }));
                }),
                catchError((error) => {
                    console.error(`Error loading menus for ${package_component.name}:`, error);
                    return of([]);
                })
            )
        );
    }

/**
 * Todo
 */
    private loadData(packages: EqualComponentDescriptor[], type: string = ''): Observable<EqualComponentDescriptor[]>[] {
        return packages.map((package_component) => {
            return this.collectDataByType(package_component.name, type).pipe(
                map((response: any) => {
                    console.log(`Response for ${package_component.name}:`, response); // Affiche la réponse
                    const data: EqualComponentDescriptor[] = []; 
                    return data;
                }),
                catchError((error) => {
                    console.error(`Error loading data for ${package_component.name}:`, error);
                    return of([]); // Retourne un tableau vide en cas d'erreur
                })
            );
        });
    }
    
        /**
     * Loads controllers for each package.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     * @returns {Observable<EqualComponentDescriptor[]>[]} An array of observables containing controller descriptors.
     */
    private loadControllers(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]>[] {
        return packages.map((package_component) =>
            this.collectControllersByPackage(package_component.name).pipe(
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
                catchError((error) => {
                    console.error(`Error loading controllers for ${package_component.name}:`, error);
                    return of([]); // Returns an empty array in case of an error
                })
            )
        );
    }






    /**
    * Fetches all available classes.
    * @returns {Observable<any>} An observable containing the list of classes.
    */
    private collectClasses(): Observable<any> {
        return from(this.api.fetch('?get=core_config_classes')).pipe(
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
    private collectPackages(): Observable<EqualComponentDescriptor[]> {
        return from(this.api.fetch('?get=config_packages')).pipe(
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
    private collectRoutesByPackage(package_name: string): Observable<any> {
        const url = `?get=core_config_routes&package=${package_name}`;
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching routes for ${package_name}:`, error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }


    private collectRoutesLives(): Observable<any>{
        const url = "?get=config_live_routes";
        return from(this.api.fetch(url)).pipe(
            catchError( (error) => {
                console.warn(`Error fetching routes lives`, error);
                return of([]);
            })
        )

    }

    private collectDataByType(package_name:string,type:string){
        const url = `?get=core_config_init-data&package=${package_name}&type=${type}`;
        return from(this.api.fetch(url)).pipe(
            catchError ((response) => {
                console.warn(`Error fetching data ${type}`, response);
                return of([]);
            })
        )
    }

    /**
     * Fetches controllers for a specific package.
     * @param {string} package_name - The package name.
     * @returns {Observable<{ data: string[], actions: string[] }>} An observable containing the controllers and actions.
     */
    private collectControllersByPackage(package_name: string): Observable<{ data: string[], actions: string[] }> {
        const url = `?get=core_config_controllers&package=${package_name}`;
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
    private collectViewsByPackage(package_name: string): Observable<string[]> {
        const url = `?get=core_config_views&package=${package_name}`;
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
    private collectMenusByPackage(package_name: string): Observable<string[]> {
        const url = `?get=core_config_menus&package=${package_name}`;
        return from(this.api.fetch(url)).pipe(
            catchError((error) => {
                console.warn(`Error fetching menus for ${package_name}:`, error);
                return of([]); // Returns an empty array in case of an error
            })
        );
    }


    // Méthode pour associer les classes aux packages
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



