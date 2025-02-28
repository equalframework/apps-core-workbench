import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';
import {EnvService } from 'sb-shared-lib';
import { prettyPrintJson } from 'pretty-print-json';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EqualComponentsProviderService } from '../../_services/equal-components-provider.service';

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
            private route: ActivatedRoute,
            private location: Location,
            public matDialog:MatDialog,
            public env:EnvService,
            public provider:EqualComponentsProviderService
        ) { }

    public async ngOnInit() {
        this.routes_for_selected_package = [];
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.ready = true;
            this.loading = false;
        });
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