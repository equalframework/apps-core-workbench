import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ContextService } from 'sb-shared-lib';
import { WorkbenchService } from './_services/workbench.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchV1Service } from './_services/workbench-v1.service';


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

    public loading: boolean = false;

    constructor(
            private context: ContextService,
            private api: WorkbenchService,
            private snackBar: MatSnackBar,
            private workbenchService:WorkbenchV1Service
        ) { }

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

        this.initialized_packages = await this.api.getInitializedPackages();

        this.loading = false;
    }

    /**
     * Select a package when user clicks on it.
     *
     * @param eq_package the package that the user has selected
     */
    public async selectNode(equalComponent: EqualComponentDescriptor) {
        console.log('selectNode', equalComponent);
        this.selectedComponent = equalComponent;
    }


    /**
     * Update the name of a package.
     *
     * @param event contains the old and new name of the package
     */
    public onupdatePackage(event: { old_node: string, new_node: string }) {
        this.api.updatePackage(event.old_node, event.new_node);
    }

    /**
     * Delete a package.
     *
     * @param eq_package the name of the package which will be deleted
     */
    public ondeletePackage(eq_package: string) {
        this.api.deletePackage(eq_package);
    }

    /**
     * Call the api to create a package.
     *
     * @param new_package the name of the new package
     */
    public oncreatePackage(new_package: any) {
        this.api.createPackage(new_package);
    }




    public goTo(ev: any) {
        let els: EqualComponentDescriptor[] = this.elements.filter(el => (el.name === ev.name && (!ev.package || ev.package === el.package)));
        this.selectNode(els[0]);
    }



}



