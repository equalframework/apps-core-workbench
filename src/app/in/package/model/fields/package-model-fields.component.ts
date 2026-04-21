import { result } from 'lodash';
import { Component, Inject, OnInit, Optional, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { Field } from './_object/Field';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { QueryParamActivatorRegistry, IQueryParamActivator, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';

@Component({
    selector: 'app-package-model-fields',
    templateUrl: './package-model-fields.component.html',
    styleUrls: ['./package-model-fields.component.scss'],
    host : {
        '(body:keydown)' : 'onKeydown($event)'
    }
})
export class PackageModelFieldsComponent implements OnInit {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public packageName = '';
    public className = '';
    public modelName = '';
    public modelDescription = '';
    public modelLink = '';
    public dummyScheme: any = {};
    public isSaving = false;

    public models: string[] = [];
    public get types(): string[] {
        // #memo - Field.type_directives is set is ngOnInit
        return Object.keys(Field.type_directives ?? {});
    }

    public selected_index = -1;

    public schema: any = {};
    // Schema of the parent class. Defaults to core\\Model
    public parentSchema: any = {fields: {id: {type: 'integer', readonly: true}, creator: {type: 'many2one', foreign_object: 'core\\User', default: 1}, created: {type: 'datetime', default: '2023-09-05T11:49:53+00:00', readonly: true}, modifier: {type: 'many2one', foreign_object: 'core\\User', default: 1}, modified: {type: 'datetime', default: '2023-09-05T11:49:53+00:00', readonly: true}, deleted: {type: 'boolean', default: false}, state: {type: 'string', selection: ['draft', 'instance', 'archive'], default: 'instance'}, name: {type: 'alias', alias: 'id'}}};

    public parentFieldList: Field[] = [];

    public fieldList: Field[] = [];
    public fieldListHistory: {field: Field[], message: string}[] = [];
    public fieldFutureHistory: {field: Field[], message: string}[] = [];

    private backgroundPreloadStarted = false;
    private provider: EqualComponentsProviderService | null = null;
    private queryParamActivatorRegistry: QueryParamActivatorRegistry;

    public fieldName: string[] = [];
    public computedFields: string[] = [];
    public selectedTabIndex = 0;  // Track selected tab for field editor: 0 = Basic, 1 = Advanced

    public loading = true;

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
        private notificationService: NotificationService,
        private injector: Injector,
        private queryParamNavigator: QueryParamNavigatorService,
        private jsonValidationService: JsonValidationService,
    ) { }

    public onKeydown(event: KeyboardEvent) {
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
    public async ngOnInit(): Promise<void> {
        this.initializeNavigation();
        this.models = await this.workbenchService.collectClasses(true).toPromise();
        Field.type_directives = await this.workbenchService.getTypeDirective();
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.packageName = this.route.parent ? this.route.parent?.snapshot.paramMap.get('package_name') : params.package_name;
            this.className = this.route.parent ? this.route.parent?.snapshot.paramMap.get('class_name') : params.class_name;
            await this.loadFields();
            void this.fetchBackgroundData();

        });

    }

    private initializeNavigation(): void {
        this.queryParamActivatorRegistry = new QueryParamActivatorRegistry();
        const tabNameToIndexMap = { basic: 0, advanced: 1 };
        const tabActivator = new QueryParamTabActivator(tabNameToIndexMap, 'selectedTabIndex');
        this.queryParamActivatorRegistry.register(tabActivator);
    }

    private async handleQueryParams(scrollDelay: number): Promise<void> {
        const queryParams = await this.route.queryParams.pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise();
        if (Object.keys(queryParams).length === 0 || !this.queryParamActivatorRegistry) {
            return;
        }
        this.queryParamNavigator.handleQueryParams(queryParams, {
            activators: this.queryParamActivatorRegistry,
            context: this,
            delay: scrollDelay,
        });
    }

    private async fetchBackgroundData(): Promise<void> {
        if (this.backgroundPreloadStarted) {
            return;
        }

        this.backgroundPreloadStarted = true;

        try {
            // Lazy-resolve provider so its constructor-triggered preload starts only in phase 3.
            if (!this.provider) {
                this.provider = this.injector.get(EqualComponentsProviderService);
            }
        } catch (err) {
            console.error('Error during background data fetching', err);

        }
    }

    private async loadFields(): Promise<void> {
        this.loading = true;

        this.fieldList = [];
        this.parentFieldList = [];

        this.schema = await this.workbenchService.getSchema(this.packageName + '\\' + this.className).toPromise();
        this.modelName = this.className || '';
        this.modelDescription = this.schema.description || '';
        this.modelLink = this.schema.link || '';

        for (const item in this.schema.fields) {
            this.fieldList.push(new Field(cloneDeep(this.schema.fields[item]), item));
        }

        if (this.schema.parent !== 'equal\\orm\\Model') {
            this.parentSchema = await this.workbenchService.getSchema(this.schema.parent).toPromise();
        }
        for (const item in this.parentSchema.fields) {
            this.parentFieldList.push(new Field(cloneDeep(this.parentSchema.fields[item]), item));
        }
        this.loading = false;
        await this.handleQueryParams(100);
    }

    public cancelOneChange(): void {
        if (this.lastIndex > 0) {
            const x = this.fieldListHistory.pop();
            if (x){
                this.fieldFutureHistory.push(x);
                this.fieldList = cloneDeep(this.fieldListHistory[this.lastIndex].field);
                this.matSnack.open('undone ' + x.message, 'INFO');
            }
        }
    }

    async cancel(): Promise<void> {
        this.loading = true;
        this.notificationService.showInfo('Canceling...');

        try {
          await this.loadFields();
          this.notificationService.showSuccess('Canceled');
        } catch (error) {
          this.notificationService.showError('Error occurred while canceling.');
        } finally {
          this.loading = false;
        }
      }

    public revertOneChange(): void {
        if (this.fieldFutureHistory.length > 0) {
            const x = this.fieldFutureHistory.pop();
            if (x) {
                this.fieldListHistory.push(x);
                this.fieldList = cloneDeep(this.fieldListHistory[this.lastIndex].field);
                this.matSnack.open('reverted ' + x.message, 'INFO');
            }
        }
    }

    public onChange(msg: string): void {
        this.fieldListHistory.push({field : cloneDeep(this.fieldList), message: msg});
        this.fieldFutureHistory = [];
        this.fieldList = [...this.fieldList];
        this.fieldName = [];
        this.computedFields = [];
        this.fieldList.forEach(field => {
            this.fieldName.push(field.name);
            if (field.type === 'computed') {
                this.computedFields.push(field.name);
            }
        });
        this.dummyScheme = {};
        this.fieldList.forEach((value: Field) => {this.dummyScheme[value.name] = value.DummySchema; });
    }

    public goBack(): void {
        this.location.back();
    }

    public isInherited(field: Field): boolean {
        if (!field) {
            return false;
        }
        for (const item of this.parentFieldList) {
            if (field.name === item.name) {
                return true;
            }
        }
        return false;
    }

    public isOverridden(field: Field): boolean {
        for (const item of this.parentFieldList) {
            if (field.name === item.name) {
                return !field.areSimilar(item);
            }
        }
        return false;
    }

    public export2JSON(): any {
        const result = cloneDeep(this.schema);
        
        // #memo - To truly update these 3 properties, we need to update the workbenchService method called
        // in savedata to send the full model payload instead of just the fields. 
        if (this.modelName) {
            result.name = this.modelName;
        }
        if (this.modelDescription) {
            result.description = this.modelDescription;
        }
        if (this.modelLink) {
            result.link = this.modelLink;
        }
        
        result.fields = {};
        this.fieldList.forEach(item => {
            if (item.isUneditable) {
                return;
            }
            if (this.isInherited(item) && !this.isOverridden(item)) {
                return;
            }
            result.fields[item.name] = cloneDeep(item.JSON);
        });
        return result;
    }

    public showJSON(): void {
        this.dialog.open(JsonViewerComponent, {data: this.export2JSON(), width: '70%', height: '85%'});
    }

    public async savedata(): Promise<void> {
        const exportedModel = this.export2JSON();
        let modelPayloadForValidation: any;

        try {
            modelPayloadForValidation = await this.buildModelPayloadWithFields(exportedModel);
        } catch (error) {
            this.notificationService.showError('Error while fetching model schema for fields validation.');
            return;
        }

        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.
            validateBySchemaType(modelPayloadForValidation, 'urn:equal:json-schema:core:model', this.packageName),
            () => this.workbenchService.updateFieldsFromClass(exportedModel, this.packageName, this.className),
            (saving) => this.isSaving = saving
        );
    }

    private async buildModelPayloadWithFields(exportedModel: any): Promise<any> {
        const entity = `${this.packageName}\\${this.className}`;
        const latestModelSchema = await this.workbenchService.getSchema(entity).toPromise();
        const modelPayload = cloneDeep(latestModelSchema || {});
        const parentFields = cloneDeep(this.parentSchema?.fields || {});
        const schemaFields = cloneDeep(modelPayload?.fields || {});
        const exportedFields = cloneDeep(exportedModel?.fields || {});

        // Keep inherited/system fields for validation and overlay current edits on top.
        modelPayload.fields = {
            ...parentFields,
            ...schemaFields,
            ...exportedFields,
        };
        return modelPayload;
    }

    public navigateToParent(): void {
        if (this.schema.parent === 'equal\\orm\\Model') {
            this.matSnack.open('You cannot edit equal\\orm\\Model', 'ERROR');
            return;
        }
        this.router.navigate(['fields', this.schema.parent.split('\\')[0], this.schema.parent.split('\\').slice(1).join('\\')]);
    }
}

