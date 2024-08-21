import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Field } from './_object/Field';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
    selector: 'package-model-fields',
    templateUrl: './package-model-fields.component.html',
    styleUrls: ['./package-model-fields.component.scss'],
    host : {
        "(body:keydown)" : "onKeydown($event)"
    }
})
export class PackageModelFieldsComponent implements OnInit {

    selected_package: string = "";
    selected_class: string = "";
    DummyScheme: any = {};

    models: string[] = [];

    selected_index: number = -1;

    scheme: any = {};
    parent_scheme: any = {"fields":{"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}};

    parentFieldList: Field[] = [];

    public fieldList: Field[] = [];
    public fieldListHistory:{field: Field[], message: string}[] = [];
    public fieldFutureHistory:{field: Field[], message: string}[] = [];

    fieldName: string[] = [];
    computeds: string[] = [];

    loading: boolean = true;

    get lastIndex(): number {
        return this.fieldListHistory.length - 1;
    }

    constructor(
        private activatedRoute: ActivatedRoute,
        private matSnack: MatSnackBar,
        private router: RouterMemory,
        private api: EmbeddedApiService,
        private dialog: MatDialog
    ) { }

    onKeydown(event: KeyboardEvent) {
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

    async ngOnInit() {
        const a = this.activatedRoute.snapshot.paramMap.get('selected_package');
        this.selected_package =  a ? a : "";
        const b = this.activatedRoute.snapshot.paramMap.get('selected_class');
        this.selected_class =  b ? b : "";
        this.scheme = await this.api.getSchema(this.selected_package + '\\' + this.selected_class);
        Field.type_directives = await this.api.getTypeDirective();
        for(let item in this.scheme["fields"]) {
            this.fieldList.push(new Field(cloneDeep(this.scheme["fields"][item]), item));
        }
        if(this.scheme.parent !== "equal\\orm\\Model") {
            this.parent_scheme = await this.api.getSchema(this.scheme.parent);
        }
        for(let item in this.parent_scheme["fields"]) {
            this.parentFieldList.push(new Field(cloneDeep(this.parent_scheme["fields"][item]), item));
        }

        this.models = await this.api.listAllModels();
        this.onChange("");
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
        this.DummyScheme = {};
        this.fieldList.forEach((value:Field) => {this.DummyScheme[value.name] = value.DummySchema;});
    }

    goBack() {
        this.router.goBack();
    }

    get types() {
        return Object.keys(Field.type_directives);
    }

    isInherited(field:Field):boolean {
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

    isOverrided(field:Field):boolean {
        for(let item of this.parentFieldList) {
            if(field.name === item.name) {
                return !field.areSimilar(item);
            }
        }
        return false;
    }

    export2JSON():any {
        let result = cloneDeep(this.scheme);
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

    showJSON() {
        this.dialog.open(Jsonator,{data:this.export2JSON(),width:"70%",height:"85%"})
    }

    async savedata() {
        this.matSnack.open("Saving...","INFO");
        await this.api.updateSchema(this.export2JSON(),this.selected_package,this.selected_class);
        this.matSnack.open("Saved","INFO");
    }

    public navigateToParent() {
        if(this.scheme["parent"] === "equal\\orm\\Model") {
            this.matSnack.open("You cannot edit equal\\orm\\Model","ERROR");
            return;
        }
        this.router.navigate(["fields",this.scheme["parent"].split("\\")[0],this.scheme["parent"].split("\\").slice(1).join("\\")])
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