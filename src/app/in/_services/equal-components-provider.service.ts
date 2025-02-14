import { Injectable, Component } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { EqualComponentDescriptor } from '../_models/equal-component-descriptor.class';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from 'sb-shared-lib';

@Injectable({
    providedIn: 'root'
})
export class EqualComponentsProviderService {
    private equalComponentsSubject = new BehaviorSubject<EqualComponentDescriptor[]>([]);
    public equalComponents$ = this.equalComponentsSubject.asObservable();
    node_type: string;
    constructor(private api: ApiService) {
        this.loadComponents();
    }


   /**
 * Retrieves components based on the given package name, component type, and an optional class name filter.
 *
 * @param {string} packageName - The name of the package.
 * @param {string} componentType - The type of component ('class', 'controller', 'view', or 'menu').
 * @param {string} [className] - Optional filter; if provided, only components whose names start with this string will be returned.
 * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
 */
public getComponents(
    packageName: string,
    componentType: string,
    className?: string
  ): Observable<EqualComponentDescriptor[]> {
    const currentData = this.equalComponentsSubject.value;
  
    // Check for cached components matching the criteria.
    const cachedComponents = currentData.filter(comp =>
      comp.package_name === packageName &&
      comp.item === componentType &&
      (className ? comp.name.startsWith(className) : true)
    );
  
    if (cachedComponents.length > 0) {
        console.log("j'ai récupéré ce qu'il y'avait en cache");
      return of(cachedComponents);
    }
  
    let componentObservable: Observable<EqualComponentDescriptor[]>;
  
    switch (componentType) {
      case 'class':
        componentObservable = this.handleClasses(packageName, className);
        break;
      case 'controller':
        componentObservable = this.handleControllers(packageName);
        break;
      case 'view':
        console.log("className : ", className);
        componentObservable = this.handleViews(packageName, className);
        break;

      case 'menu':
        componentObservable = this.handleMenus(packageName);
        break;
     case 'route':
        console.log("je suis rentreé dans route");

        if(packageName != ""){
        componentObservable = this.handleRoutes(packageName);
        }else{
            componentObservable = this.handleRoutesLives();
        }
        break;
      default:
        return of([]);
    }
  
    console.log("j'ai du utilisé l'api = (");
    // Update the cache after fetching the new components and handle errors.
    return componentObservable.pipe(
      map(newComponents => {
        this.equalComponentsSubject.next([...this.equalComponentsSubject.value, ...newComponents]);
        return newComponents;
      }),
      catchError(error => {
        console.error(`Error fetching ${componentType}s for ${packageName}:`, error);
        return of([]);
      })
    );
  }

  

  public refreshComponents(): void {
    this.loadComponents(); // loadComponents() effectue l'appel API et met à jour equalComponentsSubject
  }
  




  private handleRoutesLives(): Observable<EqualComponentDescriptor[]>{
    return this.collectRoutesLives().pipe(
        map((routesData) => {


            const components: EqualComponentDescriptor[] = [];

            for (const routePath of Object.keys(routesData)) {
                const item: { [method: string]: { description: string, operation: string } } = {};
                let packageName;
                for (const method of Object.keys(routesData[routePath]["methods"])) {
                    const operation = routesData[routePath]["methods"][method]["operation"];
                     // Extraction du package après "?quelquechose="
                    const packageMatch = operation.match(/\?[^=]+=([^\\&]+)/);
                    packageName = packageMatch ? packageMatch[1].split("\\").shift() : undefined;
                    packageName = packageName.split("_")[0];

                    item[method] = {
                        description: routesData[routePath]["methods"][method]["description"],
                        operation: routesData[routePath]["methods"][method]["operation"]
                    };
                }
            
                const file =`${packageName}/init/routes/${routesData[routePath]["info"]["file"]}`
                const component = new EqualComponentDescriptor(
                    packageName,      // Remplace par le vrai package
                    routePath,
                    "route",
                    file,
                    item
                );
            
                components.push(component);
            }
            return components;
        })
    )
  }


  private handleRoutes(packageName: string): Observable<EqualComponentDescriptor[]> {
    return this.collectRoutesByPackage(packageName).pipe(
        tap((result)=>{
            console.log(result);
        }),
        map((routesData) => {

            const components: EqualComponentDescriptor[] = [];
            //fichier contenant les routes
            for(const file in routesData){
                const routePath = `${packageName}/init/routes/${file}`;
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
                    (packageName, 
                        route_name, 
                        "route",
                        routePath, 
                        item);
                    components.push(component);
                }
            }
            return components;
        })
    )
    }


  /**
   * Handles fetching and mapping for classes.
   *
   * @param {string} packageName - The name of the package.
   * @param {string} [className] - Optional filter for class names.
   * @returns {Observable<EqualComponentDescriptor[]>} An observable of an array of EqualComponentDescriptor.
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
          this.buildComponentDescriptor(packageName, controllerName, 'get', 'data', 'controller')
        );
        const actionDescriptors = response.actions.map((actionName: string) =>
          this.buildComponentDescriptor(packageName, actionName, 'do', 'actions', 'controller')
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
                    
                  // Extraction du nom du package et du nom de la vue
                const matches = viewName.match(/^([^\\/:]+\\[^\\/:]+):([^:]+)$/);

                // Vérification si la correspondance a réussi
                if (matches) {
            const matching = matches[1]; 
            let viewNameCleaned = viewName.split('\\').slice(1).join('\\');

               // "test\Test
            return {
            package_name: packageName,       // "test"
            name: viewName.split(`\\`)[1],                   // "list.zaze", "list.tar", etc.
            type: 'view',
            file: `${packageName}/views/${viewNameCleaned}`,  // Utilisation du chemin sans extension
            item: {
                model: matching.split("\\")[1]  // "Test" extrait du "test\Test"
            }
        };
    } else {
        // Si la correspondance échoue, gérer l'erreur ou retourner des valeurs par défaut
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
            })
        ).subscribe({
            next: (packages: EqualComponentDescriptor[]) => {
                console.log('Packages loaded:', packages);
                this.equalComponentsSubject.next(packages);
                this.loadClasses(packages);
                this.loadAdditionalComponents(packages);
            },
            error: (error) => {
                console.error('Error loading components:', error);
            }
        });
    }





    /**
   * Loads additional components (controllers, views, menus) in the background.
   * @param {EqualComponentDescriptor[]} packages - The list of packages.
   */
    private loadAdditionalComponents(packages: EqualComponentDescriptor[]): void {
        const apiCalls: Observable<EqualComponentDescriptor[]>[] = [
            ...this.loadControllers(packages),
            ...this.loadViews(packages),
            ...this.loadMenus(packages),
            ...this.loadRoutes(packages)
        ];

        if (apiCalls.length === 0) {
            console.log("No packages found for loading additional components.");
            return;
        }

        forkJoin(apiCalls).subscribe({
            next: (results: EqualComponentDescriptor[][]) => {
                const allComponents = results.flat();
                if (allComponents.length > 0) {
                    console.log('Additional components loaded in background:', allComponents);
                    this.equalComponentsSubject.next([
                        ...this.equalComponentsSubject.value,
                        ...allComponents
                    ]);
                }
            },
            error: (error) => {
                console.error('Error loading additional components:', error);
            }
        });
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
    private loadClasses(packages: EqualComponentDescriptor[]): void {
        this.collectClasses().pipe(
            map((classes: any) => this.associateClassesToPackages(packages, classes))
        ).subscribe({
            next: (components: EqualComponentDescriptor[]) => {
                console.log('Components with classes:', components);
                this.equalComponentsSubject.next(components);
            },
            error: (error) => {
                console.error('Error loading classes:', error);
            }
        });
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
                        // Extraction du nom du modèle à partir du chemin du fichier
                        const matches = package_component.file.match(/([^\\/:]+):[^:]+\.php$/);
                        const modelName = matches ? matches[1] : view_name;
                
                        return {
                            package_name: package_component.name,
                            name: view_name,
                            type: 'view',
                            file: `${package_component.name}/views/${view_name}.php`,
                            item: {
                                model: modelName
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
                            name: controller_name,
                            type: 'get',
                            file: `${package_component.name}/data/${controller_name}.php`,
                            item: 'controller'
                        });
                    });

                    response.actions.forEach((action_name: string) => {
                        controllers.push({
                            package_name: package_component.name,
                            name: action_name,
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
            tap((response)=>{
                console.log(response);
            }),
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
            updatedComponents.push(packageDescriptor);

            if (classes.hasOwnProperty(packageDescriptor.name)) {
                updatedComponents.push(...this.mapClassesToDescriptors(packageDescriptor, classes[packageDescriptor.name]));
            }
        });

        return updatedComponents;
    }

    // Méthode pour transformer les noms de classes en des objets descriptors
    private mapClassesToDescriptors(packageDescriptor: EqualComponentDescriptor, classNames: string[]): EqualComponentDescriptor[] {
        return classNames.map((class_name: string) => ({
            package_name: packageDescriptor.name,
            name: class_name,
            type: 'class',
            file: `${packageDescriptor.name}/classes/${class_name.replace(/\\/g, '/')}.class.php`,
            item: 'class'
        }));
    }

    sortComponents() {
        console.log("trié");
    }
}



