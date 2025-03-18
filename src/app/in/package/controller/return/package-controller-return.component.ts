import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { ReturnFormatItem, ReturnValue } from './_objects/ReturnValue';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { cloneDeep } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usage } from 'src/app/in/_models/Params';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';

/**
 * Component used to display the component of a package (using `/package/:package_name/controller/:controller_type/:controller_name/return` route)
 *
 */
@Component({
    selector: 'package-controller-return',
    templateUrl: './package-controller-return.component.html',
    styleUrls: ['./package-controller-return.component.scss'],
    host : {
        "(body:keydown)" : "onKeydown($event)"
    }
})
export class PackageControllerReturnComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public scheme: any;

    public object: ReturnValue = new ReturnValue();

    public error:boolean = false;

    public controller_name:string;
    public controller_type:string;

    public entities:string[];

    public objectHistory:{value : ReturnValue, message:string}[] = [];
    public objectFutureHistory:{value : ReturnValue, message:string}[] = [];

    public typeControl:FormControl = new FormControl("");

    public typeIconList:{[id:string]:string};


    public types_regular:string[] = [];
    public types_custom:string[] = ReturnValue.customTypes;

    public filtered_types_regular: string[] = [];
    public filtered_types_custom: string[] = [];

    constructor(
            private TypeUsage: TypeUsageService,
            private workbenchService: WorkbenchService,
            private matSnack: MatSnackBar,
            private route: ActivatedRoute,
            private dialog: MatDialog,
            private location: Location
        ) { }

    public async ngOnInit() {

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.controller_type = params['controller_type'];
            this.controller_name = params['controller_name'];
            this.scheme = await this.workbenchService.announceController(this.controller_type, this.controller_name).toPromise();
            this.object = new ReturnValue(cloneDeep(this.scheme.announcement.response));
            this.typeControl.setValue(this.object.type)
            this.typeControl.valueChanges.subscribe(value => {
                    this.filtered_types_regular = this._filter(value, 'types_regular');
                    this.filtered_types_custom = this._filter(value, 'types_custom');
                    this.changeType(value);
                });

        });

        this.typeIconList = this.TypeUsage.typeIcon;
        this.types_regular = await this.workbenchService.getTypeList();
        this.entities = await this.workbenchService.collectClasses(true).toPromise();

        this.filtered_types_regular = this._filter('', 'types_regular');
        this.filtered_types_custom = this._filter('', 'types_custom');

    }

    private getRouteParamsFromSnapshot(routeSnapshot: ActivatedRouteSnapshot): { [key: string]: any } {
        let params = { ...routeSnapshot.params };
        routeSnapshot.children.forEach(childSnapshot => {
            params = { ...params, ...this.getRouteParamsFromSnapshot(childSnapshot) };
        });
        return params;
    }

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

    public changeContentType(value:string) {
        this.object.contentType = value;
        this.onChange("changed content-type");
    }

    public changeCharset(value:string) {
        this.object.charset = value;
        this.onChange("changed charset");
    }

    public changeAcceptOrigin(value:any) {
        this.object.acceptOrigin = value;
        this.onChange("changed accept-origin");
    }

    public changeType(value:string) {
        if(!this.types_custom.includes(value) && !this.types_regular.includes(value)) {
            return;
        }
        this.object.type = value;
        this.object.entity = "";
        this.object.usage = new Usage("");
        this.object._has_values = false;
        this.object.values = [];
        this.onChange("Changed return type");
    }

    public changeQty(value:string) {
        this.object.qty = value;
        this.onChange("Changed Quantity");
    }

    public changeEntity(value:string) {
        this.object.entity = value;
        this.onChange("Changed entity");
    }

    public changeHasFormat(value:boolean) {
        this.object._has_values = value;
        this.onChange("toggled values");
    }

    public changeFormatType(index:number,value:string) {
        this.object.values[index].type = value;
        this.object.values[index].selection = [];
        this.object.values[index]._has_selection = false;
        this.onChange("Changed type of a field of values");
    }

    public changeFormatName(index:number,value:string) {
        this.object.values[index].name = value;
        this.onChange("Changed name of a field of values");
    }

    public changeFormatDescription(index:number,value:string) {
        this.object.values[index].description = value;
        this.onChange("Changed description of a field of values");
    }

    public changeHasSelection(index:number,value:boolean) {
        this.object.values[index]._has_selection = value;
        this.onChange("toggled selection");
    }


    public addFormatItem() {
        this.object.values.push( new ReturnFormatItem() );
        this.onChange("Added format item");
    }

    public deleteFormatItem(index:number) {
        this.object.values.splice(index,1);
        this.onChange("deleted format item");
    }

    public changeSelectionItem(index:number,jndex:number,value:string) {
        this.object.values[index].selection[jndex] = value;
        this.onChange("edited selection of format item "+index);
    }

    public addFormatSelectionItem(index:number) {
        this.object.values[index].selection.push(undefined);
        this.onChange("Added selection item in format item "+index);
    }

    public deleteFormatSelectionItem(index:number,jndex:number) {
        this.object.values[index].selection.splice(jndex, 1);
        this.onChange("Added selection item in format item "+index);
    }


    protected _filter(value: string, list_name: 'types_regular' | 'types_custom') {
        if(!value.length) {
            return this[list_name];
        }
        return this[list_name].filter((item:string) => item.toLowerCase().includes(value.toLowerCase()));
    }

    // HISTORY MANAGEMENT

    public cancelOneChange() {
        if(this.lastIndex > 0) {
        let x = this.objectHistory.pop();
        if(x){
            this.objectFutureHistory.push(x)
            this.object = cloneDeep(this.objectHistory[this.lastIndex].value);

            this.resetTypeInput();

            this.matSnack.open("undone "+x.message, "INFO");
        }
        }
    }

    public resetTypeInput() {
        this.typeControl.setValue(this.object.type,{emitEvent:false});
        this.filtered_types_regular = this._filter(this.object.type, 'types_regular');
        this.filtered_types_custom = this._filter(this.object.type, 'types_custom');
    }

    public revertOneChange() {
        if(this.objectFutureHistory.length > 0) {
            let x = this.objectFutureHistory.pop();
            if(x) {
                this.objectHistory.push(x);
                this.object = cloneDeep(this.objectHistory[this.lastIndex].value);

                this.resetTypeInput;

                this.matSnack.open("reverted "+x.message,"INFO");
            }
        }
    }

    public onChange(msg:string) {
        this.objectHistory.push({value : cloneDeep(this.object), message:msg});
        this.objectFutureHistory = [];
    }

    public get lastIndex():number {
        return this.objectHistory.length - 1;
    }


    public noCancel(event: KeyboardEvent) {
        console.log(event);
        if( event.key === "z" && event.ctrlKey) {
        event.preventDefault();
        }
        if( event.key === "y" && event.ctrlKey) {
        event.preventDefault();
        }
    }

    public goBack() {
        this.location.back();
    }

    public showJson() {
        this.dialog.open(JsonViewerComponent, {data:this.object.export(),width:"75%",height:"85%"});
    }

    public save() {
        let payload = cloneDeep(this.scheme);
        payload.announcement.response = this.object.export();
        this.workbenchService.updateController(this.controller_name, this.controller_type, payload.announcement);
    }

}
