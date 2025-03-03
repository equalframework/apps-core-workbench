import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { Location } from '@angular/common';
import { prettyPrintJson } from 'pretty-print-json';
import { ActivatedRoute} from '@angular/router';
import { EqualComponentDescriptor } from '../../_models/equal-component-descriptor.class';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentsProviderService } from '../../_services/equal-components-provider.service';
@Component({
    selector: 'package-controllers',
    templateUrl: './package-controllers.component.html',
    styleUrls: ['./package-controllers.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
/**
 * Component used to display the component of a package (using `/package/:package_name/controllers` route)
 */
export class PackageControllersComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public controllers: any;

    public package_name: string = '';

    public selected_controller: EqualComponentDescriptor;
    public selected_property = '';
    public selected_type_controller = '';

    public schema: any;
    public controller_access_restrained: boolean;
    public selected_desc = '';
    public fetch_error = false;

    public step = 1;
    public ready = false;
    public loading = true;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
            private provider: EqualComponentsProviderService
        ) { }

    public async ngOnInit() {
        this.init()
    }

    public async init() {

        // this.selected_controller = '';
        this.selected_property = '';

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.loadControllers();
        });

    }

    private async loadControllers() {
        this.loading = true;
        this.controllers = this.provider.getComponents(this.package_name,'controller');
        this.loading = false;
    }

    /**
     * Select a node.
     *
     * @param eq_route the route that the user has selected
     */
    public async onSelectNode(eq_controller: EqualComponentDescriptor) {
        this.selected_controller = eq_controller;
    }

    public changeStep(event:number) {
        this.step = event
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

    public submitRequest(params: any) {
        console.warn(params);
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
