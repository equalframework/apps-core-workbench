import { Injectable} from '@angular/core';
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
    private componentsCacheMapSubject = new BehaviorSubject<Map<string, Map<string, EqualComponentDescriptor[]>>>(new Map());
    get componentsCacheMap$(): Observable<Map<string, Map<string, EqualComponentDescriptor[]>>> {
        return this.componentsCacheMapSubject.asObservable();
      }
    public equalComponents$ = this.equalComponentsSubject.asObservable();

    constructor(private api: ApiService) {
        this.preloadComponents();
    }



    getComponentCountByType(type: string, packageName?: string): Observable<number> {
        return this.componentsCacheMap$.pipe(
          map(cacheMap => {
            if (!packageName) {
              return this.countAllPackages(cacheMap, type);
            }
            return this.countSpecificPackage(cacheMap, type, packageName);
          })
        );
      }










    /**
     * Retrieves a specific component based on the cache or via the API.
     * @param package_name - The package name.
     * @param component_type - The component type.
     * @param class_name - Filter for the model (for some types, e.g., 'view').
     * @param component_name - The exact name of the component to search for.
     */
    public getComponent(
        package_name: string,
        component_type: string,
        class_name: string,
        component_name: string
    ): Observable<EqualComponentDescriptor | null> {
        // Check the cache using the reactive map
        const cacheMap = this.componentsCacheMapSubject.getValue();
        const packageCache = cacheMap.get(package_name);
        if (packageCache) {
        let componentsToSearch: EqualComponentDescriptor[];
        if (component_type === '') {
            componentsToSearch = Array.from(packageCache.values()).flat();
        } else {
            componentsToSearch = packageCache.get(component_type) || [];
        }
        const foundComponent = componentsToSearch.find(comp => {
            const matchesClassName = class_name ? comp.item.model.startsWith(class_name) : true;
            const matchesComponentName = comp.name === component_name;
            return matchesClassName && matchesComponentName;
        });
        if (foundComponent) {
            return of(foundComponent);
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
     * @param package_name - The package name.
     * @param component_type - The component type ('class', 'controller', 'view', 'menu', 'route').
     * @param class_name - (Optional) Filter for the model.
     */
    public getComponents(
        package_name: string,
        component_type: string,
        class_name?: string
    ): Observable<EqualComponentDescriptor[]> {
        const cacheMap = this.componentsCacheMapSubject.getValue();
        const packageCache = cacheMap.get(package_name);

        if (packageCache && packageCache.has(component_type)) {
        const components = packageCache.get(component_type)?.filter(component =>
            class_name ? component.item.model === class_name : true
        );
        return of(components && components.length > 0 ? components : []);
        }
        console.log("bon bah go dans l'api hn");
        // If not found in cache, retrieve via the API
        return this.fetchComponents(package_name, component_type, class_name).pipe(
        map(newComponents => {
            // Optionally, update the cache here
            if (!cacheMap.has(package_name)) {
            cacheMap.set(package_name, new Map<string, EqualComponentDescriptor[]>());
            }
            this.componentsCacheMapSubject.next(cacheMap);
            return newComponents;
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
    * @param package_name - The package name.
    * @param componentType - The component type ('class', 'controller', 'view', 'menu', 'route').
    * @param className     - (Optional) Filter for the model name (for some types like 'view').
    * @returns An Observable containing an array of EqualComponentDescriptor.
    */
    private fetchComponents(
        package_name: string,
        component_type: string,
        class_name?: string
    ): Observable<EqualComponentDescriptor[]> {
        const packageComponent: EqualComponentDescriptor = {
            name: package_name,
            package_name: '',
            type: '',
            file: '',
            item: undefined
        };

        switch (component_type) {
            case 'class':
                return this.retrieveClasses([packageComponent]);
            case 'controller':
                return this.retrieveControllers([packageComponent]);
            case 'view':
                return this.retrieveViews([packageComponent], class_name);
            case 'menu':
                return this.retrieveMenus([packageComponent]);
            case 'route':
                return package_name !== ''
                    ? this.retrieveRoutes([packageComponent])
                    : this.retrieveAllRoutesLives();
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
                this.updatePackagesMap(packages)
                const currentCacheMap = this.componentsCacheMapSubject.getValue();
                let updatedCacheMap = new Map<string, Map<string, EqualComponentDescriptor[]>>(currentCacheMap);

                Array.from(updatedCacheMap.keys()).forEach((packageKey: string) => {
                    const isPackageValid = packages.some(packageComponent => packageKey === packageComponent.name);

                    if (!isPackageValid) {
                        console.log(`Removing package from cache: ${packageKey}`);
                        updatedCacheMap.delete(packageKey);
                    }else{
                        if (!updatedCacheMap.has(packageKey)) {
                            console.log(`Adding package to cache: ${packageKey}`);
                            updatedCacheMap.set(packageKey, new Map());
                        }
                    }
                });
                this.componentsCacheMapSubject.next(updatedCacheMap);


                // If a package is specified, filter the packages accordingly.
                let filtered_packages: EqualComponentDescriptor[] = packages;
                if (package_name) {
                        filtered_packages = packages.filter(packageComponent => packageComponent.name === package_name);
                }
                if (filtered_packages.length === 0) {
                console.warn(`No package found with name "${package_name}".`);
                 // Remove package from the components subject
                 const updatedComponents = this.equalComponentsSubject.getValue().filter(comp => comp.package_name !== package_name);
                 this.equalComponentsSubject.next(updatedComponents);
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
     * Builds an EqualComponentDescriptor based on the provided parameters.
     *
     * @param {string} package_name - The package name.
     * @param {string} name - The name of the component.
     * @param {string} type - The type of the component (e.g., 'get', 'do', 'view', 'menu').
     * @param {string} folder - The folder where the component's file is located.
     * @param {string} item - The item type (e.g., 'controller', 'view', 'menu').
     * @returns {EqualComponentDescriptor} The constructed EqualComponentDescriptor object.
     */
    private buildComponentDescriptor(
        package_name: string,
        name: string,
        type: string,
        folder: string,
        item: string
        ): EqualComponentDescriptor {
        return {
            package_name: package_name,
            name: name.split('_').slice(1).join('_'),
            type: type,
            file: `${package_name}/${folder}/${name}.php`,
            item: item
        };
    }

    /**
     * Loads all available components.
     */
    private preloadComponents(): void {
        this.collectAllPackages()
          .pipe(
            switchMap((packages: EqualComponentDescriptor[]) => {
                return of(packages);
            }),
            take(1)
          )
          .subscribe({
              next: (packages: EqualComponentDescriptor[]) => {
                this.updatePackagesMap(packages);
                console.log('Packages loaded:', packages);
                this.preloadComponentsForPackages(packages);
                console.log("Updated map:", this.componentsCacheMapSubject.getValue());
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

    if (componentTypes.length === 0 || componentTypes.includes("controller")) {
        apiCalls.push(this.retrieveControllers(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("view")) {
        apiCalls.push(this.retrieveViews(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("menu")) {
        apiCalls.push(this.retrieveMenus(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("route")) {
        apiCalls.push(this.retrieveRoutes(packages));
    }
    if (componentTypes.length === 0 || componentTypes.includes("class")) {
        apiCalls.push(this.retrieveClasses(packages));
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
                this.updateComponentsMap(allComponents);
            }
        },
        error: (response) => {
            console.error('Error preloading additional components:', response);
        }
    });
    }

    private updatePackagesMap(packages: EqualComponentDescriptor[]): void {
        const cacheMap = this.componentsCacheMapSubject.getValue();

        packages.forEach(pkg => {
          const pkgName = pkg.package_name;
          if (!cacheMap.has(pkgName)) {
            // Create an empty package entry if it doesn't exist
            cacheMap.set(pkgName, new Map<string, EqualComponentDescriptor[]>());
          }
        });

        // Update the BehaviorSubject with the new map state
        this.componentsCacheMapSubject.next(cacheMap);

        // Flatten the map to update `equalComponentsSubject`, including a package entry for each package
        const allComponentsArray: EqualComponentDescriptor[] = [];
        cacheMap.forEach((pkgMap, pkgName) => {
          // Package entry
          allComponentsArray.push(new EqualComponentDescriptor(pkgName, pkgName, 'package'));
          // Associated components
          pkgMap.forEach((componentsArray) => {
            allComponentsArray.push(...componentsArray);
          });
        });
        this.equalComponentsSubject.next(allComponentsArray);

      }

    private updateComponentsMap(components: EqualComponentDescriptor[]): void {
        const cacheMap = this.componentsCacheMapSubject.getValue();

        components.forEach(component => {
            const pkg = component.package_name;
            const type = component.type;

            // Optionally create the package if it's missing
            if (!cacheMap.has(pkg)) {
            cacheMap.set(pkg, new Map<string, EqualComponentDescriptor[]>());
            }
            const packageMap = cacheMap.get(pkg)!;

            if (!packageMap.has(type)) {
            packageMap.set(type, []);
            }

            const existingComponents = packageMap.get(type)!;
        // Check if the component already exists in the list
        const componentExists = existingComponents.some(existingComponent =>
            existingComponent.name === component.name && existingComponent.package_name === component.package_name
        );

            // Push the component only if it doesn't exist in the list
        if (!componentExists) {
            existingComponents.push(component);
        }
        });

        // Remove components that are no longer in the components list
        cacheMap.forEach((packageMap, pkg) => {
            packageMap.forEach((existingComponents, type) => {
                // Filter out components that no longer exist in the `components` list
                packageMap.set(type, existingComponents.filter(existingComponent =>
                    components.some(component =>
                        component.name === existingComponent.name && component.package_name === existingComponent.package_name
                    )
                ));
            });
        });
        // Update the BehaviorSubject with the modified map
        this.componentsCacheMapSubject.next(cacheMap);
        // Flatten the map to update `equalComponentsSubject`, including a package entry for each package
        const allComponentsArray: EqualComponentDescriptor[] = [];
        cacheMap.forEach((pkgMap, pkgName) => {
            // Package entry
            allComponentsArray.push(new EqualComponentDescriptor(pkgName, pkgName, 'package'));
            // Associated components
            pkgMap.forEach((componentsArray) => {
            allComponentsArray.push(...componentsArray);
            });
        });

        this.equalComponentsSubject.next(allComponentsArray);
    }





    /**
     * Retrieve all the routes in live.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable that emits an array of `EqualComponentDescriptor` objects representing live routes.
     *          Each `EqualComponentDescriptor` contains the route information such as:
     *          - `package_name`: The name of the package the route belongs to.
     *          - `name`: The route path (the route URL).
     *          - `type`: The type of component (in this case, "route").
     *          - `file`: The file path for the route configuration.
     *          - `item`: An object containing HTTP methods (e.g., GET, POST) as keys, with descriptions and operations.
     */
    private retrieveAllRoutesLives(): Observable<EqualComponentDescriptor[]> {
        return this.collectRoutesLives().pipe(
            map(rawData => this.formatRoutesLives(rawData))
        )
    }



    /**
     * Retrieve controller for the given packages.
     *
     * This method processes controllers by collecting data and actions for each package,
     * then constructs `EqualComponentDescriptor` objects for both data and action controllers.
     *
     * @param {EqualComponentDescriptor[]} packages - The list of packages to collect controllers for.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable emitting an array of `EqualComponentDescriptor` objects,
     *          each representing a controller or an action within the packages.
     */
    private retrieveControllers(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]> {
        return this.collectControllers(packages).pipe(
            map(rawData => this.formatControllers(rawData))
          );
    }


    /**
     * Retrieves route data for the given packages.
     *
     * This method processes routes by collecting route information from each package,
     * and constructs `EqualComponentDescriptor` objects representing routes for each package.
     *
     * @param {EqualComponentDescriptor[]} packages - The list of packages to collect routes for.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable emitting an array of `EqualComponentDescriptor` objects,
     *          each representing a route within the packages.
     */
    private retrieveRoutes(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]> {
      return this.collectRoutes(packages).pipe(
        map(rawData => this.formatRoutes(rawData))
      )
    }


    /**
     * Retrieves all the classes for the given packages.
     * @param {EqualComponentDescriptor[]} packages - The list of packages.
     */
    private retrieveClasses(packages: EqualComponentDescriptor[]):Observable<EqualComponentDescriptor[]> {
            return this.collectAllClasses().pipe(
                map((classes: any) => {
                    return this.associateClassesToPackages(packages, classes)
    })
    );
    }

    /**
     * Retrieves view descriptors for the given packages.
     * Optionally filters the views based on a provided class name.
     *
     * @param {EqualComponentDescriptor[]} packages - The list of packages to collect views for.
     * @param {string} [class_name] - (Optional) A filter to restrict views by class name.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable emitting an array of `EqualComponentDescriptor` objects representing the views.
     */
    private retrieveViews(packages: EqualComponentDescriptor[], class_name?: string): Observable<EqualComponentDescriptor[]> {
       return this.collectViews(packages).pipe(
        map(rawData => this.formatViews(rawData,class_name))
       )
    }



    /**
     * Retrieve menus for the given packages.
     *
     * @param {EqualComponentDescriptor[]} packages - The list of packages to collect menus for.
     *
     * @returns {Observable<EqualComponentDescriptor[]>}
     *          An observable emitting an array of `EqualComponentDescriptor` objects representing the menus.
     */
    private retrieveMenus(packages: EqualComponentDescriptor[]): Observable<EqualComponentDescriptor[]> {
        return this.collectMenus(packages).pipe(
            map(rawData => this.formatMenus(rawData) )
        )
    }


    private collectControllers(packages: EqualComponentDescriptor[]): Observable<Array<{ package: EqualComponentDescriptor, response: any }>> {
        return forkJoin(
          packages.map(packageComponent =>
            this.collectControllersFromPackage(packageComponent.name).pipe(
              map(response => ({ package: packageComponent, response })),
              catchError(response => {
                console.error(`Error loading controllers for ${packageComponent.name}:`, response);
                return of({ package: packageComponent, response: { data: [], actions: [] } });
              })
            )
          )
        );
      }

    private collectMenus(packages: EqualComponentDescriptor[]): Observable<Array<{ package: EqualComponentDescriptor, menus: string[] }>> {
        return forkJoin(
          packages.map(packageComponent =>
            this.collectMenusFromPackage(packageComponent.name).pipe(
              map(menus => ({ package: packageComponent, menus })),
              catchError(response => {
                console.error(`Error loading menus for ${packageComponent.name}:`, response);
                return of({ package: packageComponent, menus: [] });
              })
            )
          )
        );
    }

    private collectViews(packages: EqualComponentDescriptor[]): Observable<Array<{ package: EqualComponentDescriptor, views: string[] }>> {
        return forkJoin(
          packages.map(packageComponent =>
            this.collectViewsFromPackage(packageComponent.name).pipe(
              map(views => ({ package: packageComponent, views })),
              catchError(response => {
                console.error(`Error loading views for ${packageComponent.name}:`, response);
                return of({ package: packageComponent, views: [] });
              })
            )
          )
        );
    }

    private collectRoutes(packages: EqualComponentDescriptor[]): Observable<Array<{ package: EqualComponentDescriptor, routesData: any }>> {
        return forkJoin(
            packages.map(packageComponent =>
            this.collectRoutesFromPackage(packageComponent.name).pipe(
                map(routesData => ({ package: packageComponent, routesData })),
                catchError(response => {
                console.error(`Error loading routes for ${packageComponent.name}:`, response);
                return of({ package: packageComponent, routesData: {} });
                })
            )
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
            catchError(response => {
                console.error('Error fetching classes:', response);
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
                    package_name:package_name,
                    name: package_name,
                    type: 'package',
                    file: package_name,
                    item: 'package'
                }))
            ),
            catchError(response => {
                console.error('Error fetching packages:', response);
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
            catchError((response) => {
                console.warn(`Error fetching controllers for ${package_name}:`, response);
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
            catchError((response) => {
                console.warn(`Error fetching views for ${package_name}:`, response);
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
            catchError((response) => {
                console.warn(`Error fetching menus for ${package_name}:`, response);
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
                item: ''
            };
        });
    }


    private formatRoutesLives(routesData: any): EqualComponentDescriptor[] {
    const components: EqualComponentDescriptor[] = [];

    for (const routePath of Object.keys(routesData)) {
        if (!routesData[routePath]["methods"]) {
            continue;
        }

        const item: { [method: string]: { description: string, operation: string } } = {};
        let package_name = '';

        for (const method of Object.keys(routesData[routePath]["methods"])) {
            const methodData = routesData[routePath]["methods"][method];
            const operation = methodData["operation"];

            const packageMatch = operation.match(/\?[^=]+=([^\\&]+)/);
            if (packageMatch) {
                package_name = packageMatch[1].split("\\").shift() || '';
            }

            package_name = package_name.split("_")[0];

            item[method] = {
                description: methodData["description"],
                operation: methodData["operation"]
            };
        }

        const file = `${package_name}/init/routes/${routesData[routePath]["info"]["file"]}`;

        const component = new EqualComponentDescriptor(
            package_name,
            routePath,
            "route",
            file,
            item
        );

        components.push(component);
    }

    return components;
    }

    private formatRoutes(data: Array<{ package: EqualComponentDescriptor, routesData: any }>): EqualComponentDescriptor[] {
        const result: EqualComponentDescriptor[] = [];
        data.forEach(({ package: packageComponent, routesData }) => {
          for (const file in routesData) {
            const routePath = `${packageComponent.name}/init/routes/${file}`;
            for (const routeName in routesData[file]) {
              const item: any = {};
              for (const method in routesData[file][routeName]) {
                const routeInfo = routesData[file][routeName][method];
                item[method] = {
                  description: routeInfo.description,
                  operation: routeInfo.operation
                };
              }
              result.push(new EqualComponentDescriptor(packageComponent.name, routeName, "route", routePath, item));
            }
          }
        });
        return result;
    }

    private formatViews(data: Array<{ package: EqualComponentDescriptor, views: string[] }>, className?: string): EqualComponentDescriptor[] {
        const result: EqualComponentDescriptor[] = [];
        data.forEach(({ package: packageComponent, views }) => {
          views
            .filter(view => {
              if (!className) return true;
              const extractedClass = view.split('\\').pop()?.split(":")[0];
              return extractedClass === className;
            })
            .forEach(view => {
              const cleanedViewName = view.split('\\').slice(1).join('\\');
              const modelName = cleanedViewName.split(':')[0];
              result.push({
                package_name: packageComponent.name,
                name: cleanedViewName.split("\\").pop() || '',
                type: 'view',
                file: className
                  ? `${packageComponent.name}/views/${cleanedViewName}`
                  : `${packageComponent.name}/views/${view}.json`,
                item: {
                  model: className ? modelName : (modelName.split(':')[0] ?? '')
                }
              });
            });
        });
        return result;
      }

      private formatMenus(data: Array<{ package: EqualComponentDescriptor, menus: string[] }>): EqualComponentDescriptor[] {
        const result: EqualComponentDescriptor[] = [];
        data.forEach(({ package: pkg, menus }) => {
          menus.forEach(menuName => {
            result.push({
              package_name: pkg.name,
              name: menuName,
              type: 'menu',
              file: `${pkg.name}/menus/${menuName}.php`,
              item: ''
            });
          });
        });
        return result;
      }

    private formatControllers(data: Array<{ package: EqualComponentDescriptor, response: any }>): EqualComponentDescriptor[] {
        const result: EqualComponentDescriptor[] = [];

        data.forEach(({ package: pkg, response }) => {
            const dataDescriptors = response.data.map((controllerName: string) =>
            this.buildComponentDescriptor(pkg.name, controllerName.replace(/\s+/g, ''), 'get', 'data', 'controller')
            );
            const actionDescriptors = response.actions.map((actionName: string) =>
            this.buildComponentDescriptor(pkg.name, actionName.replace(/\s+/g, ''), 'do', 'actions', 'controller')
            );
            result.push(...dataDescriptors, ...actionDescriptors);
        });

        return result;
    }

    // Count components across all packages
    private countAllPackages(cacheMap: Map<string, Map<string, EqualComponentDescriptor[]>>, type: string): number {
        if (type === 'package') {
          return cacheMap.size;
        }
        return Array.from(cacheMap.values())
          .map(pkgMap => this.countComponentsByType(pkgMap, type))
          .reduce((sum, count) => sum + count, 0);
      }

      // Count components within a specific package
      private countSpecificPackage(
        cacheMap: Map<string, Map<string, EqualComponentDescriptor[]>>,
        type: string,
        packageName: string
      ): number {
        const packageMap = cacheMap.get(packageName);
        if (!packageMap) {
          return 0;
        }
        return this.countComponentsByType(packageMap, type);
      }

      // Handles counting logic for 'controller' and other types
      private countComponentsByType(pkgMap: Map<string, EqualComponentDescriptor[]>, type: string): number {
        if (type === '') {
            return Array.from(pkgMap.values())
              .reduce((sum, components) => sum + components.length, 0);
          }
        if (type === 'controller') {
          return (pkgMap.get('do')?.length ?? 0) + (pkgMap.get('get')?.length ?? 0);
        }
        return pkgMap.get(type)?.length ?? 0;
      }
}



