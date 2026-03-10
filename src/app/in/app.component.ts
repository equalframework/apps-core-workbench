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
    public child_loaded = false;
    public selectedComponent: EqualComponentDescriptor | undefined;
    public classes_for_selected_package: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public elements: EqualComponentDescriptor[] = [];
    // http://equal.local/index.php?get=core_config_classes

    public initialized_packages:string[];
    public schema:any;
    public selected_type_controller:string = '';
    public fetch_error:boolean = false;
    public route_list:any = {};
    search_scope ='package'
    public loading: boolean = false;

    constructor(
            private api: WorkbenchService,
            private router: Router,

        ) { }

    handleSearchScopeChange(newScope: string): void {
        this.search_scope = newScope;
        console.log('Received new search scope:', this.search_scope);
    }

    public async ngOnInit() {

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

    private restoreSelectedComponentFromUrl() {
        const fromUrl = this.router.parseUrl(this.router.url);
        let restored: EqualComponentDescriptor | undefined;

        if (fromUrl.root.children['primary'] && fromUrl.root.children['primary'].segments.length > 0) {
            const segments = fromUrl.root.children['primary'].segments;
            if (segments.length === 4 && segments[0].path === 'package' && segments[2].path === 'routes') {
                restored = {
                    package_name: segments[1].path,
                    name: segments[3].path,
                    type: 'route'
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
            if (segments.length === 8 && segments[2].path === 'entity' && segments[4].path === 'view' && segments[6].path === 'type') {
                restored = {
                    package_name: segments[0].path === 'package' ? segments[1].path : '',
                    name: `${segments[3].path}:${segments[7].path}.${segments[5].path}`,
                    type: 'view',
                    item: {
                        model: segments[3].path,
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

    public async refresh() {
        this.init();
    }

    // load all components
    public async init() {
        this.loading = true;
        this.elements = [];

        this.initialized_packages = await this.api.getInitializedPackages().toPromise();
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
    public onupdatePackage(event: { old_node: string, new_node: string }) {
        //this.api.updatePackage(event.old_node, event.new_node);
    }

    get package_name(): string {
        return this.selectedComponent?.package_name || this.selectedComponent?.name || '';
    }

    public goTo(ev: any) {
        let els: EqualComponentDescriptor[] = this.elements.filter(el => (el.name === ev.name && (!ev.package || ev.package === el.package)));
        this.selectNode(els[0]);
    }



}



