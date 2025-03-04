import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { WorkbenchService } from './_services/workbench.service'
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';


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
        ) { }

    handleSearchScopeChange(newScope: string): void {
        this.search_scope = newScope;
        console.log('Received new search scope:', this.search_scope);
        }
    public async ngOnInit() {
        /*
        let args = this.router.retrieveArgs();
        if(args && args['selected']) {
            this.selectNode(args['selected']);
        }
        */
        await this.init();
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
     * Select a package when user clicks on it.
     *
     * @param eq_package the package that the user has selected
     */
    public selectNode(equalComponent: EqualComponentDescriptor) {
        console.log('selectNode', equalComponent);

        if (this.selectedComponent && this.areNodesEqual(this.selectedComponent, equalComponent)) {
            this.selectedComponent = undefined;
        } else {
            this.selectedComponent = equalComponent;
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





    public goTo(ev: any) {
        let els: EqualComponentDescriptor[] = this.elements.filter(el => (el.name === ev.name && (!ev.package || ev.package === el.package)));
        this.selectNode(els[0]);
    }



}



