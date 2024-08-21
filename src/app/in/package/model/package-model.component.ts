import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ContextService } from 'sb-shared-lib';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { FieldClassArray } from './_object/FieldClassArray';
import { FieldClass } from './_object/FieldClass';
import { fi } from 'date-fns/locale';
import { cloneDeep, update } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorDialogComponent, DeleteConfirmationDialogComponent} from 'src/app/_modules/workbench.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';

@Component({
    selector: 'package-model',
    templateUrl: './package-model.component.html',
    styleUrls: ['./package-model.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageModelComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public child_loaded = false;
    public step = 1;
    public package_name: string = '';
    public class_name: string = '';

    public selected_field:FieldClass|undefined = undefined;
    public classes_for_package_name: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public packages: string[];
    // http://equal.local/index.php?get=core_config_classes
    private eq_class: any;
    public schema: any;
    public fields_for_selected_class: FieldClass[];
    public types: any;

    public loading = true;
    public ready = false;

    constructor(
            private context: ContextService,
            private api: EmbeddedApiService,
            private snackBar: MatSnackBar,
            private route:ActivatedRoute,
            private location: Location,
            public matDialog:MatDialog

        ) { }

    public async ngOnInit() {
        this.packages = await this.api.getPackages();
        this.eq_class = await this.api.getClasses();
        this.types = await this.api.getTypes();

        this.init();
    }

    public ngOnDestroy() {
        console.debug('PackageModelComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private async init() {
        this.loading = true;
        this.selected_field = undefined;
        this.child_loaded = false;

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
                this.package_name = params['package_name'];
                this.class_name = params['class_name'];
                this.classes_for_package_name = this.eq_class[this.package_name];

                await this.loadClass();
                this.ready = true;
                this.loading = false;
            });

    }

    private async loadClass() {
        try {
            this.schema = await this.api.getSchema(this.package_name + '\\' + this.class_name);
        }
        catch(response) {
            console.log('unexpected error', response);
        }
    }

    /**
     * Select a class.
     *
     * @param class_name the class that the user has selected
     */
    public async onclickClassSelect(class_name: string) {
        this.class_name = class_name;
        await this.loadClass();
    }

    public async onChangeStep(step:number) {
        this.step = step;
        /*
        if(step == 2) {
            this.route.navigate(['/fields',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        if(step===3) {
            this.route.navigate(['/views',"entity",this.package_name+'\\'+this.selected_class],{"class":this.selected_class})
        }
        if(step===4) {
            this.route.navigate(['/translation/model',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        if(step===5) {
            this.route.navigate(['/workflow',this.package_name,this.selected_class],{"class":this.selected_class})
        }
        */
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onupdateClass(event: { old_node: string, new_node: string }) {
        this.api.updateClass(this.package_name, event.old_node, event.new_node);
    }

    /**
     * Delete a class for the selected package.
     *
     * @param eq_class the name of the class which will be deleted
     */
    public async ondeleteClass(eq_class: string) {
        let res = await this.api.deleteModel(this.package_name,eq_class)
        if(!res){
            this.snackBar.open('Deleted');
            this.class_name = '';
            this.init();
        }
    }

    /**
     * Create a class for the selected package.
     *
     * @param eq_class the name of the new class
     */
    public oncreateClass() {
        let d = this.matDialog.open(MixedCreatorDialogComponent, {
                data: {
                    type: "class",
                    package: this.package_name,
                    lock_type : true,
                    lock_package: true,
                },
                width : "40em",
                height: "26em"
            });

        d.afterClosed().subscribe(() => {
            // Do stuff after the dialog has closed
            this.init()
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
        this.location.back()
    }

    public regenerateSchema():any {
        var res:any = cloneDeep(this.schema)
        res["fields"] = {
            "id":{"type":"integer","readonly":true},
            "deleted":{"type":"boolean","default":false},
            "state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"}
        }
        for(var item in this.fields_for_selected_class) {
            const name:string = this.fields_for_selected_class[item].name
            res["fields"][name] = this.fields_for_selected_class[item].current_scheme
        }

        return res
    }



}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}