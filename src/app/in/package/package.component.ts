import { Component, OnInit, ViewEncapsulation, Output, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-package',
    templateUrl: './package.component.html',
    styleUrls: ['./package.component.scss'],
    encapsulation: ViewEncapsulation.None
})
/**
 * Component used to display the component of a package (using /controllers/:package route)
 */
export class PackageComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public ready: boolean = false;

    public package_name: string;

    public packages: any;
    public controllers: any;
    public selected_package = '';
    public selected_controller = '';
    public selected_property = '';
    public selected_type_controller = '';
    public schema: any;
    public controller_access_restrained: boolean;
    public selected_desc = '';
    public fetch_error = false

    public step = 1;

    constructor(
            private snackBar: MatSnackBar,
            private route: ActivatedRoute,
            private matDialog: MatDialog
        ) { }

    public async ngOnInit() {
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.ready = true;
        });
    }

    public ngOnDestroy() {
        console.debug('PackageComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


    /**
     * Select a property when user click on it.
     *
     * @param property the property that the user has selected
     */
    public async onclickPropertySelect(property: string) {
        this.selected_property = property;
    }

    /**
     * Update the name of a controller.
     *
     * @param event contains the old and new name of the controller
     */
    public onupdateController(event: { type: string, old_node: string, new_node: string }) {

    }

    /**
     * Delete a controller.
     *
     * @param controller the name of the controller which will be deleted
     */
    public async ondeleteController(event: { type: string, name: string }) {
    }

    /**
     * Call the api to create a controller.
     *
     * @param new_package the name of the new controller
     */
    public oncreateController(event: { type: string, name: string }) {

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

    public getProperties() {
        return Object.keys(this.schema);
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
        // this.route.goBack()

    }

}
