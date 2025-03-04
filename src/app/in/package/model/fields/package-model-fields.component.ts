import { result } from 'lodash';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Field } from './_object/Field';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/in/_services/notification.service';

@Component({
    selector: 'package-model-fields',
    templateUrl: './package-model-fields.component.html',
    styleUrls: ['./package-model-fields.component.scss'],
    host : {
        "(body:keydown)" : "onKeydown($event)"
    }
})
export class PackageModelFieldsComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public package_name: string = "";
    public class_name: string = "";
    public dummySchema: any = {};

    public models: string[] = [];
    public get types() {
        // #memo - Field.type_directives is set is ngOnInit
        return Object.keys(Field.type_directives ?? {});
    }

    public selected_index: number = -1;

    public schema: any = {};
    // Schema of the parent class. Defaults to core\\Model
    public parent_schema: any = {"fields":{"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}};

    public parentFieldList: Field[] = [];

    public fieldList: Field[] = [];
    public fieldListHistory:{field: Field[], message: string}[] = [];
    public fieldFutureHistory:{field: Field[], message: string}[] = [];

    public fieldName: string[] = [];
    public computeds: string[] = [];

    public loading: boolean = true;

    get lastIndex(): number {
        return this.fieldListHistory.length - 1;
    }

    constructor(
        private route: ActivatedRoute,
        private matSnack: MatSnackBar,
        private router: RouterMemory,
        private workbenchService: WorkbenchService,
        private dialog: MatDialog,
        private location: Location,
        private notificationService:NotificationService
    ) { }

    public onKeydown(event: KeyboardEvent) {
        if( event.key === "z" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.cancelOneChange();
        }
        if( event.key === "y" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.revertOneChange();
        }
    }
    public async ngOnInit() {
        this.models = await this.workbenchService.collectClasses(true).toPromise();
        Field.type_directives = await this.workbenchService.getTypeDirective();

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            console.log('package-model-fields::ngOnInit(activatedRoute)', params)
            this.package_name = params['package_name'];
            this.class_name = params['class_name'];
            this.loadFields();
        });

    }

    private async loadFields() {
        this.loading = true;

        this.fieldList = [];
        this.parentFieldList = [];

        this.schema = await this.workbenchService.getSchema(this.package_name + '\\' + this.class_name).toPromise();

        for(let item in this.schema["fields"]) {
            this.fieldList.push(new Field(cloneDeep(this.schema["fields"][item]), item));
        }

        if(this.schema.parent !== "equal\\orm\\Model") {
            this.parent_schema = await this.workbenchService.getSchema(this.schema.parent).toPromise();
        }
        for(let item in this.parent_schema["fields"]) {
            this.parentFieldList.push(new Field(cloneDeep(this.parent_schema["fields"][item]), item));
        }

        this.loading = false;
    }

    public cancelOneChange() {
        if(this.lastIndex > 0) {
            let x = this.fieldListHistory.pop();
            if(x){
                this.fieldFutureHistory.push(x);
                this.fieldList = cloneDeep(this.fieldListHistory[this.lastIndex].field);
                this.matSnack.open("undone "+x.message,"INFO");
            }
        }
    }

    async cancel() {
        this.loading = true;
        this.notificationService.showInfo("Canceling...");

        try {
          await this.loadFields();
          this.notificationService.showSuccess("Canceled");
        } catch (error) {
          this.notificationService.showError("Error occurred while canceling.");
        } finally {
          this.loading = false;
        }
      }

    public revertOneChange() {
        if(this.fieldFutureHistory.length > 0) {
            let x = this.fieldFutureHistory.pop();
            if(x) {
                this.fieldListHistory.push(x);
                this.fieldList = cloneDeep(this.fieldListHistory[this.lastIndex].field);
                this.matSnack.open("reverted "+x.message,"INFO");
            }
        }
    }

    public onChange(msg:string) {
        this.fieldListHistory.push({field : cloneDeep(this.fieldList), message:msg});
        this.fieldFutureHistory = [];
        this.fieldList = [...this.fieldList];
        this.fieldName = [];
        this.computeds = [];
        this.fieldList.forEach(field => {
            this.fieldName.push(field.name);
            if(field.type === 'computed') {
                this.computeds.push(field.name);
            }
        });
        this.dummySchema = {};
        this.fieldList.forEach((value:Field) => {this.dummySchema[value.name] = value.DummySchema;});
    }

    public goBack() {
        this.location.back();
    }

    public isInherited(field: Field): boolean {
        if(!field) {
            return false;
        }
        for(let item of this.parentFieldList) {
            if(field.name === item.name) {
                return true;
            }
        }
        return false;
    }

    public isOverrided(field:Field): boolean {
        for(let item of this.parentFieldList) {
            if(field.name === item.name) {
                return !field.areSimilar(item);
            }
        }
        return false;
    }

    public export2JSON(): any {
        let result = cloneDeep(this.schema);
        result["fields"] = {};
        this.fieldList.forEach(item => {
            if(item.isUneditable) {
                return;
            }
            if(this.isInherited(item) && !this.isOverrided(item)) {
                return;
            }
            result["fields"][item.name] = cloneDeep(item.JSON);
        })
        return result;
    }

    public showJSON() {
        this.dialog.open(Jsonator,{data:this.export2JSON(),width:"70%",height:"85%"})
    }

    public async savedata() {
        this.notificationService.showInfo("Saving....");
        this.workbenchService.updateFieldsFromClass(this.export2JSON(),this.package_name,this.class_name).subscribe((result) => {
                if(result.success){
                    this.notificationService.showSuccess(result.message);
                }else{
                    this.notificationService.showError(result.message);
                }
        });
    }

    public navigateToParent() {
        if(this.schema["parent"] === "equal\\orm\\Model") {
            this.matSnack.open("You cannot edit equal\\orm\\Model","ERROR");
            return;
        }
        this.router.navigate(["fields",this.schema["parent"].split("\\")[0],this.schema["parent"].split("\\").slice(1).join("\\")])
    }
}

@Component({
    selector: 'jsonator',
    template: "<pre [innerHtml]='datajson'><pre>"
})
class Jsonator implements OnInit {
    constructor(
        @Optional() public dialogRef: MatDialogRef<Jsonator>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
    ) {}

    ngOnInit(): void {

    }

    get datajson() {
        return prettyPrintJson.toHtml(this.data)
    }
}