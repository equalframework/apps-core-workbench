import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { WorkbenchService } from './_services/workbench.service'
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import {Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-component',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class AppComponent implements OnInit {
    public childLoaded = false;
    public selectedComponent: EqualComponentDescriptor | undefined;
    public classesForSelectedPackage: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public elements: EqualComponentDescriptor[] = [];
    // http://equal.local/index.php?get=core_config_classes

    public initializedPackages: string[];
    public schema: any;
    public selectedTypeController = '';
    public fetchError = false;
    public routeList:any = {};
    searchScope = 'all';
    searchFilters: { [key: string]: string } = {};
    searchTerms: string[] = [];
    public loading = false;

    constructor(
            private router: Router,
        ) {
        }

    handleSearchScopeChange(newScope: string): void {
        setTimeout(() => {
            this.searchScope = newScope;
        }, 0);
    }

    handleSearchFiltersChange(filters: { [key: string]: string }): void {
        setTimeout(() => {
            this.searchFilters = filters;
        }, 0);
    }

    handleSearchTermsChange(terms: string[]): void {
        setTimeout(() => {
            this.searchTerms = terms;
        }, 0);
    }

    public async ngOnInit(): Promise<void> {
        // Listen to route changes and update selectedComponent
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.restoreSelectedComponentFromUrl();
            });

        // Initial restore
        this.restoreSelectedComponentFromUrl();

        await this.init();
    }

    private restoreSelectedComponentFromUrl(): void {
        const fromUrl = this.router.parseUrl(this.router.url);
        let restored: EqualComponentDescriptor | undefined;

        if (fromUrl.root.children['primary'] && fromUrl.root.children['primary'].segments.length > 0) {
            const segments = fromUrl.root.children['primary'].segments;
                // Route
            if (segments.length >= 4 && segments[0].path === 'package' && segments[2].path === 'route') {
                // Collect all segments from index 3 onwards to handle routes like '/auth/pwd'
                const routeSegments = segments.slice(3).map(seg => seg.path).join('/');
                restored = {
                    package_name: segments[1].path,
                    name: routeSegments,
                    type: 'route',
                } as EqualComponentDescriptor;
            } else
                // Menu
            if (segments.length === 4 && segments[0].path === 'package' && segments[2].path === 'menu') {
                restored = {
                    package_name: segments[1].path,
                    name: segments[3].path,
                    type: 'menu'
                } as EqualComponentDescriptor;
            } else
                // Controller
            if (segments.length === 5 && segments[0].path === 'package' && segments[2].path === 'controller') {
                restored = {
                    package_name: segments[1].path,
                    name: segments[4].path,
                    type: segments[3].path
                } as EqualComponentDescriptor;
            } else
                // Model
            if (segments.length === 4 && segments[0].path === 'package' && segments[2].path === 'model') {
                restored = {
                    package_name: segments[1].path,
                    name: segments[3].path,
                    type: 'model'
                } as EqualComponentDescriptor;
            } else
                // View
            if (segments.length === 4 && segments[2].path === 'view') {
                restored = {
                    package_name: segments[0].path === 'package' ? segments[1].path : '',
                    name: segments[3].path,
                    type: 'view',
                    item: {
                        model: segments[3].path.split(':')[0],
                    }
                } as EqualComponentDescriptor;
            } else
                // Package
            if (segments[0].path === 'package' && segments.length === 2) {
                restored = {
                    type: 'package',
                    name: segments[1].path,
                    package_name: segments[1].path
                } as EqualComponentDescriptor;
            }
        }

        if (restored) {
            this.selectNode(restored);
            sessionStorage.setItem('selectedComponent', JSON.stringify(this.selectedComponent));
        }
    }

    public async refresh(): Promise<void> {
        this.init();
    }

    // load all components
    public async init(): Promise<void> {
        this.loading = true;
        this.elements = [];

        this.loading = false;
    }

    /**
     * Select a component
     *
     * @param equalComponent the component to select
     */
    public selectNode(equalComponent: EqualComponentDescriptor) {

        if (this.selectedComponent && this.areNodesEqual(this.selectedComponent, equalComponent)) {
            this.selectedComponent = undefined;
        } else {
            this.selectedComponent = equalComponent;
            history.replaceState({ ...history.state, selectedComponent: null }, '');
            sessionStorage.setItem('selectedComponent', JSON.stringify(this.selectedComponent));
        }
    }



    public areNodesEqual(node1: EqualComponentDescriptor | undefined, node2: EqualComponentDescriptor): boolean {
        return node1?.package_name === node2?.package_name &&
               node1?.name === node2?.name &&
               node1?.type === node2?.type;
    }

    /**
     * Update the name of a package.
     *
     * @param event contains the old and new name of the package
     */
    public onupdatePackage(event: { oldNode: string, newNode: string }): void {
        //this.api.updatePackage(event.oldNode, event.newNode);
    }

    get package_name(): string {
        return this.selectedComponent?.package_name || this.selectedComponent?.name || '';
    }

    public goTo(ev: any): void {
        const els: EqualComponentDescriptor[] = this.elements.filter(el => (el.name === ev.name && (!ev.package || ev.package === el.package)));
        this.selectNode(els[0]);
    }

    /**
     * Get the human-readable name for a component type
     * @param type The component type (package, class, get, do, route, view, menu, model)
     * @returns The display name
     */
    getComponentTypeName(type: string): string {
        const typeNames: { [key: string]: string } = {
            package: 'packages',
            class: 'models',
            get: 'data providers',
            do: 'action handlers',
            route: 'routes',
            view: 'views',
            menu: 'menus',
            model: 'models',
            list: 'lists',
            form: 'forms',
            'data-provider': 'data providers',
            controller: 'controllers'
        };
        return typeNames[type] || type;
    }

    /**
     * Convert filter key to display name
     * @param key The filter key (filter_package_name, filter_type, etc.)
     * @returns The display name for the filter
     */
    getFilterDisplayName(key: string): string {
        const filterNames: { [key: string]: string } = {
            'package_name': 'package',
            'name': 'name',
            'type': 'type',
            'file': 'file',
            'item': 'item'
        };
        return filterNames[key] || key;
    }

    /**
     * Get the component type for styling from the search scope
     * @returns The component type or empty string for 'all'
     */
    getScopeComponentType(): string {
        // Handle special cases where scope is a grouping
        if (this.searchScope === 'controller') {
            return 'get'; // Use 'get' for styling purposes
        }
        if (this.searchScope === 'view') {
            return 'view';
        }
        return this.searchScope;
    }

    /**
     * Check if there are any active filters
     */
    hasAnyFilters(): boolean {
        return Object.keys(this.searchFilters).length > 0;
    }

    /**
     * Check if there are any search terms entered
     */
    hasAnySearchTerms(): boolean {
        return this.searchTerms.length > 0;
    }

    /**
     * Get the keys of the active filters
     */
    getFilterKeys(): string[] {
        return Object.keys(this.searchFilters);
    }

    /**
     * Get the CSS class for a filter value if it's a valid component type
     * @param value The filter value to check
     * @returns The class string or empty string if not a valid type
     */
    getFilterValueClass(value: string): string {
        const validTypes = ['package_name', 'package', 'class', 'model', 'get', 'do', 'route', 'view', 'menu', 'list', 'form'];
        if (validTypes.includes(value.toLowerCase())) {
            if (value.toLowerCase() === 'controller') {
                return 'component-color-get colorized';
            }
            if (value.toLowerCase() === 'list' || value.toLowerCase() === 'form') {
                return 'component-color-view colorized';
            }
            if (value.toLowerCase() === 'model') {
                return 'component-color-class colorized';
            }
            if (value.toLowerCase() === 'package_name') {
                return 'component-color-package colorized';
            }
            return `component-color-${value.toLowerCase()} colorized`;
        }
        return '';
    }
}
