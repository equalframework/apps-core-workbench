import { Component, Inject, OnInit, OnDestroy, Optional, Input } from '@angular/core';
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
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';

/**
 * Component used to display the response of a controller
 * Can be used standalone via routing or as a tab component with @Input properties
 */
@Component({
    selector: 'app-package-controller-return',
    templateUrl: './package-controller-return.component.html',
    styleUrls: ['./package-controller-return.component.scss'],
    host : {
        "(body:keydown)" : "onKeydown($event)",
    }
})
export class PackageControllerReturnComponent implements OnInit, OnDestroy {

    private readonly announcementFieldsToCopy: string[] = [
        'response',
        'access',
        'providers',
        'constants',
        'description',
        'deprecated',
        'help',
        'usage'
    ];

    // @Input properties for tab-based usage
    @Input() controllerName = '';
    @Input() controllerType = '';
    @Input() controllerPackage = '';

    // @Input properties for data from parent component
    @Input() types: string[] = [];
    @Input() entities: string[] = [];
    @Input() returnScheme: any = null;
    @Input() dataReady = false;
    @Input() isSaving = false;

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public scheme: any;

    public object: ReturnValue = new ReturnValue();

    public error = false;

    public objectHistory: {value: ReturnValue, message: string}[] = [];
    public objectFutureHistory: {value: ReturnValue, message: string}[] = [];

    public typeControl: FormControl = new FormControl('');

    public typeIconList: {[id: string]: string};


    public typesRegular: string[] = [];
    public typesCustom: string[] = ReturnValue.customTypes;

    public filteredTypesRegular: string[] = [];
    public filteredTypesCustom: string[] = [];

    constructor(
            private TypeUsage: TypeUsageService,
            private workbenchService: WorkbenchService,
            private matSnack: MatSnackBar,
            private dialog: MatDialog,
            private routerMemory: RouterMemory,
            private jsonValidator: JsonValidationService
        ) { }

    public ngOnInit(): void {
        // Use @Input properties from parent component (required)
        this.typeIconList = this.TypeUsage.typeIcon;
        this.typesRegular = this.types;

        // Initialize object from scheme if provided
        if (this.returnScheme && this.returnScheme.announcement && this.returnScheme.announcement.response) {
            this.scheme = this.returnScheme;
            this.object = new ReturnValue(cloneDeep(this.scheme.announcement.response));
            this.typeControl.setValue(this.object.type);
            this.typeControl.valueChanges.subscribe(value => {
                this.filteredTypesRegular = this._filter(value, 'typesRegular');
                this.filteredTypesCustom = this._filter(value, 'typesCustom');
                this.changeType(value);
            });
        }

        this.filteredTypesRegular = this._filter('', 'typesRegular');
        this.filteredTypesCustom = this._filter('', 'typesCustom');
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private getRouteParamsFromSnapshot(routeSnapshot: ActivatedRouteSnapshot): { [key: string]: any } {
        let params = { ...routeSnapshot.params };
        routeSnapshot.children.forEach(childSnapshot => {
            params = { ...params, ...this.getRouteParamsFromSnapshot(childSnapshot) };
        });
        return params;
    }

    public onKeydown(event: KeyboardEvent): void {
        if ( event.key === 'z' && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.cancelOneChange();
        }
        if ( event.key === 'y' && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.revertOneChange();
        }
    }

    public changeContentType(value: string): void {
        this.object.contentType = value;
        this.onChange('changed content-type');
    }

    public changeCharset(value: string): void {
        this.object.charset = value;
        this.onChange('changed charset');
    }

    public changeAcceptOrigin(value: any): void {
        this.object.acceptOrigin = value;
        this.onChange('changed accept-origin');
    }

    public changeType(value: string): void {
        if (!this.typesCustom.includes(value) && !this.typesRegular.includes(value)) {
            return;
        }
        this.object.type = value;
        this.object.entity = '';
        this.object.usage = new Usage('');
        this.object._hasValues = false;
        this.object.values = [];
        this.onChange('Changed return type');
    }

    public changeQty(value: string): void {
        this.object.qty = value;
        this.onChange('Changed Quantity');
    }

    public changeEntity(value: string): void {
        this.object.entity = value;
        this.onChange('Changed entity');
    }

    public changeHasFormat(value: boolean): void {
        this.object._hasValues = value;
        this.onChange('toggled values');
    }

    public changeFormatType(index: number, value: string): void {
        this.object.values[index].type = value;
        this.object.values[index].selection = [];
        this.object.values[index]._hasSelection = false;
        this.onChange('Changed type of a field of values');
    }

    public changeFormatName(index: number, value: string): void {
        this.object.values[index].name = value;
        this.onChange('Changed name of a field of values');
    }

    public changeFormatDescription(index: number, value: string): void {
        this.object.values[index].description = value;
        this.onChange('Changed description of a field of values');
    }

    public changeHasSelection(index: number, value: boolean): void {
        this.object.values[index]._hasSelection = value;
        this.onChange('toggled selection');
    }


    public addFormatItem(): void {
        this.object.values.push( new ReturnFormatItem() );
        this.onChange('Added format item');
    }

    public deleteFormatItem(index: number): void {
        this.object.values.splice(index, 1);
        this.onChange('deleted format item');
    }

    public changeSelectionItem(index: number, jndex: number, value: string): void {
        this.object.values[index].selection[jndex] = value;
        this.onChange('edited selection of format item ' + index);
    }

    public addFormatSelectionItem(index: number): void {
        this.object.values[index].selection.push(undefined);
        this.onChange('Added selection item in format item ' + index);
    }

    public deleteFormatSelectionItem(index: number, jndex: number): void {
        this.object.values[index].selection.splice(jndex, 1);
        this.onChange('Deleted selection item in format item ' + index);
    }


    protected _filter(value: string, listName: 'typesRegular' | 'typesCustom'): string[] {
        if (!value.length) {
            return this[listName];
        }
        return this[listName].filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
    }

    // HISTORY MANAGEMENT

    public cancelOneChange(): void {
        if (this.lastIndex > 0) {
        const x = this.objectHistory.pop();
        if (x){
            this.objectFutureHistory.push(x);
            this.object = cloneDeep(this.objectHistory[this.lastIndex].value);

            this.resetTypeInput();

            this.matSnack.open('undone ' + x.message, 'INFO');
        }
        }
    }

    public resetTypeInput(): void {
        this.typeControl.setValue(this.object.type, {emitEvent: false});
        this.filteredTypesRegular = this._filter(this.object.type, 'typesRegular');
        this.filteredTypesCustom = this._filter(this.object.type, 'typesCustom');
    }

    public revertOneChange(): void {
        if (this.objectFutureHistory.length > 0) {
            const x = this.objectFutureHistory.pop();
            if (x) {
                this.objectHistory.push(x);
                this.object = cloneDeep(this.objectHistory[this.lastIndex].value);

                this.resetTypeInput();

                this.matSnack.open('reverted ' + x.message, 'INFO');
            }
        }
    }

    public onChange(msg: string): void {
        this.objectHistory.push({value : cloneDeep(this.object), message: msg});
        this.objectFutureHistory = [];
    }

    public get lastIndex(): number {
        return this.objectHistory.length - 1;
    }


    public noCancel(event: KeyboardEvent): void {
        if ( event.key === 'z' && event.ctrlKey) {
        event.preventDefault();
        }
        if ( event.key === 'y' && event.ctrlKey) {
        event.preventDefault();
        }
    }

    public goBack(): void {
        this.routerMemory.goBack();
    }

    public showJson(): void {
        this.dialog.open(JsonViewerComponent, {data: this.object.export(), width: '75%', height: '85%'});
    }

    public formatJson(json: any): any {
        const formatted = cloneDeep(json);
        formatted['name'] = this.controllerName;
        formatted['type'] = this.controllerType;
        formatted['package_name'] = this.controllerPackage;

        const announcement = this.scheme?.announcement ?? {};
        for (const key of this.announcementFieldsToCopy) {
            if (announcement[key] !== undefined) {
                formatted[key] = announcement[key];
            }
        }

        return formatted;
      }

    public save(): void {
        const payload = cloneDeep(this.scheme);
        payload.announcement.response = this.object.export();
        this.jsonValidator.validateAndSave(
            this.jsonValidator.validateBySchemaType(this.formatJson(payload.announcement), 'controller', this.controllerPackage),
            () => this.workbenchService.updateController(this.controllerPackage, this.controllerName, this.controllerType, payload.announcement),
            (saving) => this.isSaving = saving
        );

        this.workbenchService.updateController(this.controllerPackage, this.controllerName, this.controllerType, payload.announcement);
    }

}
