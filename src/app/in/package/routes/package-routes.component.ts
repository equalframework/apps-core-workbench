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
    selector: 'package-routes',
    templateUrl: './package-routes.component.html',
    styleUrls: ['./package-routes.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageRoutesComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public routelist:any = {};
    public child_loaded = false;

    public package_name: string = "core";

    public selected_route: EqualComponentDescriptor;

    public routes_for_selected_package: string[] = [];
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
        this.routes_for_selected_package = [];
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.loadRoutes();
        });

        this.ready = true;
    }

    private async loadRoutes() {
        this.loading = false;
        let y = await this.api.getRoutesByPackage(this.package_name);
        for(let file in y) {
            for(let route in y[file]) {
                this.real_name[file.split("-")[0]+"-"+route] = route;
                this.routes_for_selected_package.push(file.split("-")[0]+"-"+route);
                this.routelist[file.split("-")[0]+"-"+route] = {"info":{"file":file,"package":this.package_name},"methods":y[file][route]};
            }
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
        let d = this.matDialog.open(MixedCreatorDialogComponent,{
            data: {
                type: "route",
                package: this.package_name,
                lock_type : true,
                lock_package: true,
            }, width : "40em", height: "26em"
        })

        d.afterClosed().subscribe(() => {
            // Do stuff after the dialog has closed
            this.loadRoutes()
        });
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