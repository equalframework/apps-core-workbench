import { Component, OnInit, ViewEncapsulation, Output, OnDestroy } from '@angular/core';
import { prettyPrintJson } from 'pretty-print-json';
import { ActivatedRoute} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { EqualComponentsProviderService } from '../_services/equal-components-provider.service';

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

    public packageName: string;

    public packages: any;
    public controllers: any;
    public selectedPackage = '';
    public selectedController = '';
    public selectedProperty = '';
    public selectedTypeController = '';
    public schema: any;
    public controllerAccessRestrained: boolean;
    public selectedDesc = '';
    public fetchError = false

    public step = 1;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
        ) { }

    public async ngOnInit(): Promise<void> {
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.packageName = params['package_name'];
            this.ready = true;
        });
    }

    public ngOnDestroy(): void {
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
        this.selectedProperty = property;
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
    public async onDeleteController(event: { type: string, name: string }): Promise<void> {
    }

    /**
     * Call the api to create a controller.
     *
     * @param new_package the name of the new controller
     */
    public onCreateController(event: { type: string, name: string }): void {

    }

    /**
     *
     * @returns a pretty HTML string of a schema in JSON.
     */
    public getJSONSchema(): string | null {
        if(this.schema) {
            return this.prettyPrint(this.schema);
        }
        return null;
    }

    public getProperties(): string[] {
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

    public getBack(): void {
        // this.route.goBack()
        this.location.back();

    }

}
