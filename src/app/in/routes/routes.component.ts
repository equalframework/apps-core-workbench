import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ContextService, EnvService } from 'sb-shared-lib';
import { prettyPrintJson } from 'pretty-print-json';
import { cloneDeep, update } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent, DeleteConfirmationDialogComponent} from 'src/app/_modules/workbench.module';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'routes',
    templateUrl: './routes.component.html',
    styleUrls: ['./routes.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class RoutesComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public routelist:any = {};
    public child_loaded = false;

    public selected_route: EqualComponentDescriptor;

    public real_name:{[id:string]:string} = {};

    public schema: any;
    public types: any;


    public ready = false;
    public loading = true;

    constructor(
            private api: WorkbenchService,
            private route: ActivatedRoute,
            private location: Location,
            public matDialog:MatDialog,
            public env:EnvService
        ) { }

    public async ngOnInit() {
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.loadRoutes();
        });

        this.ready = true;
    }

    private async loadRoutes() {
        this.loading = false;
        let routes:any = await this.api.getRoutesLive();

        for(let route of Object.keys(routes)) {
            let descriptor = routes[route];
            this.real_name[route] = route;
//            this.routes_for_selected_package.push(file.split("-")[0]+"-"+route);
            this.routelist[route] = {"info":{"file":descriptor['info']['file'],"package":''},"methods":descriptor['methods']};
        }

        this.loading = false;
    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_route: EqualComponentDescriptor) {
        this.selected_route = eq_route;
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onupdateNode(change: {old_node: EqualComponentDescriptor, new_node: EqualComponentDescriptor}) {
    }

    /**
     * Delete a class for the selected package.
     *
     * @param eq_route the name of the class which will be deleted
     */
    public ondeleteNode(eq_route: EqualComponentDescriptor) {
    }

    /**
     * Create a class for the selected package.
     *
     * @param eq_route the name of the new class
     */
    public oncreateClass() {
        // routes should not be created in Live mode
        // add a route to package initialization instead
    }


    /**
     *
     * @returns a pretty HTML string of a schema in JSON.
     */
    public getJSONSchema() {
        if(this.schema) {
            return this.prettyPrint(this.schema);
        }
        return null;
    }

    /**
     * Function to pretty-print JSON objects as an HTML string
     *
     * @param input a JSON
     * @returns an HTML string
     */
    private prettyPrint(input: any) {
        return prettyPrintJson.toHtml(input);
    }

    public getBack() {
        this.location.back();
    }

}