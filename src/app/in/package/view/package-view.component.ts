import { Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry, QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { View, ViewGroup, ViewGroupByItem, ViewItem, ViewOperation, ViewSection } from './_objects/View';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Usage } from 'src/app/in/_models/Params';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { EqualComponentDescriptor } from '../../_models/equal-component-descriptor.class';
import { EqualComponentsProviderService } from '../../_services/equal-components-provider.service';
import { NotificationService } from '../../_services/notification.service';
import { WorkbenchService } from '../../_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';

@Component({
    selector: 'app-package-view',
    templateUrl: './package-view.component.html',
    styleUrls: ['./package-view.component.scss']
})
export class PackageViewComponent implements OnInit {

    viewId: string;
    entity: string;

    viewScheme: any;
    obk = Object.keys;
    viewObj: View = new View({ layout: { items: [] }, operations: [], groupBy: { items: [] } }, '');
    name: string;
    node: EqualComponentDescriptor;

    types = ViewItem.typeList;
    loading = true;
    error = false;
    isSaving = false;

    classScheme: any = { fields: {} };
    fields: string[] = [];

    compliancyCache: { ok: boolean, id_list: string[] };
    groups: string[] = [];
    iconType: { [id: string]: string };

    collectController: string[] = ['core_model_collect'];
    actionControllers: string[];

    // Tab management
    selectedTabIndex = 0;
    private tabNameToIndexMap: { [key: string]: number } = {
      layout: 0,
      header: 1,
      actions: 2,
      routes: 3,
      advanced: 4
    };

    // Navigation
    private queryParamActivatorRegistry: QueryParamActivatorRegistry;

    constructor(
        private route: ActivatedRoute,
        private workbenchService: WorkbenchService,
        private popup: MatDialog,
        private snackBar: MatSnackBar,
        private TypeUsage: TypeUsageService,
        private location: Location,
        private provider: EqualComponentsProviderService,
        private notificationService: NotificationService,
        private queryParamNavigator: QueryParamNavigatorService,
        private jsonValidationService: JsonValidationService
    ) { }

    async ngOnInit(): Promise<void> {
        this.initializeNavigation();

        await this.init();
    }

    async init(): Promise<void> {
        this.loading = true;
        this.error = false;
        this.collectController = ['core_model_collect'];
        this.actionControllers = [];
        this.groups = [];

        const packageName = this.route.snapshot.paramMap.get('package_name');
        const entityView = this.route.snapshot.params.entity_view;
        const [entityName, rest] = entityView.split(':');
        const [viewType, viewName] = rest.split('.');

        this.iconType = this.TypeUsage.typeIcon;

        if (!packageName || !entityName || !viewType || !viewName) { return; }

        this.name = viewName;
        this.entity = entityName;
        this.viewId = viewType + '.' + viewName;

        try {
            // Phase 1 : essential data loaded
            const [compo, schema, viewScheme] = await Promise.all([
                this.provider.getComponent(packageName, 'view', this.entity, (this.entity + ':' + this.viewId)).toPromise(),
                this.workbenchService.getSchema(`${packageName}\\${entityName}`).toPromise(),
                this.workbenchService.readView(packageName, this.viewId, entityName).toPromise()
            ]);

            if (!compo) {
                console.warn('Component not found.');
                this.loading = false;
                return;
            }

            this.node = compo;
            this.classScheme = schema || { fields: {} };
            this.fields = this.obk(this.classScheme.fields);
            this.viewScheme = viewScheme;

            const nodeNameParts = this.node.name ? this.node.name.split(':') : [];
            const viewNamePart = (nodeNameParts.length > 1 && nodeNameParts[1])
                ? nodeNameParts[1].split('.')[0]
                : '';
            this.viewObj = new View(this.viewScheme, viewNamePart);

            // Display UI as soon as possible, even if some secondary data is still loading in the background
            this.loading = false;

            // Subscribe to query params changes to handle navigation (e.g. activating tabs based on 'selectedTab' query param)
            this.route.queryParams.subscribe(params => {
                if (Object.keys(params).length > 0 && this.queryParamActivatorRegistry) {
                    this.queryParamNavigator.handleQueryParams(params, {
                        activators: this.queryParamActivatorRegistry,
                        context: this,
                        delay: 100
                    });
                }
            });

            // Phase 2 : secondary data loaded in the background (non-blocking)
            this.loadSecondaryData(packageName);
        } catch (err) {
            this.error = true;
            this.loading = false;
        }
    }

    private async loadSecondaryData(packageName: string): Promise<void> {
        try {
            const [tempControllers, actionControllers, groupsData] = await Promise.all([
                this.workbenchService.collectControllers('data', packageName).toPromise(),
                this.workbenchService.collectControllers('actions').toPromise(),
                this.workbenchService.getCoreGroups().toPromise()
            ]);

            const announcements = await Promise.all(
                tempControllers.map(item => this.workbenchService.announceController(item).toPromise())
            );
            for (let i = 0; i < tempControllers.length; i++) {
                const data = announcements[i];
                if (!data) { continue; }
                if (!data.announcement.extends || data.announcement.extends !== 'core_model_collect') { continue; }
                this.collectController.push(tempControllers[i]);
            }

            this.actionControllers = actionControllers;
            for (const key in groupsData) {
                this.groups.push(groupsData[key].name);
            }
        } catch (err) {
            console.warn('Failed to load secondary data:', err);
        }
    }

    /**
     * Handle view object changes from child tab components
     * Called when any tab component modifies the view object
     */
    onViewObjChange(view: View): void {
        this.viewObj = view;
    }

    // Call id_compliant method on view_obj and cache it
    get idCompliancy(): {ok: boolean, id_list: string[]} {
        this.compliancyCache =  this.viewObj.id_compliant([]);
        return this.compliancyCache;
    }

    // Look for ids duplicates in compliancy_cache
    get idDuplicates(): string {
        const filtered = this.compliancyCache.id_list.filter((item, index) => this.compliancyCache.id_list.indexOf(item) !== index);
        return filtered.join(',');
    }

    openJsonViewer(): void {
        this.popup.open(JsonViewerComponent, {data: this.viewObj.export(), width: '70%', height: '85%'});
    }

    goBack(): void {
        this.location.back();
    }

    save(): void {
        if (this.isSaving) { return; }

        if (!this.idCompliancy.ok) {
            this.notificationService.showError('Cannot save: ' +
                (this.idDuplicates.length > 0
                    ? 'Some IDs are duplicated (' + this.idDuplicates + ')'
                    : 'Some items do not have an ID'));
            return;
        }

        const viewData = this.viewObj.export();
        const schemaId = `urn:equal:json-schema:core:view.${this.viewId.split('.')[0]}.default`;

        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.validateView(viewData, schemaId),
            () => this.workbenchService.saveView(viewData, this.node.package_name, this.entity, this.viewId),
            (saving) => this.isSaving = saving
        );
    }

    cancel(): void {
        setTimeout(async () => {
            await this.init();
            this.snackBar.open('Changes canceled', '', {
                duration: 1000,
            });
        }, 0);
    }

    handleCustomButton(name: string): void {
        if (name === 'Show JSON'){
            this.openJsonViewer();
            return;
        }
    }

    /**
     * Initialize the registry of activators for query param navigation
     * Configure the available activators (tabs, menus, etc.)
     */
    private initializeNavigation(): void {
        this.queryParamActivatorRegistry = new QueryParamActivatorRegistry();

        // Register a tab activator that listens to 'selectedTab' query param and activates the corresponding tab
        const tabActivator = new QueryParamTabActivator(this.tabNameToIndexMap, 'selectedTabIndex');
        this.queryParamActivatorRegistry.register(tabActivator);
    }

    ToNameDisp(name: string): string {
        const a = name.replaceAll('_', ' ');
        const b = a.split(' ').map(item => item.charAt(0).toUpperCase() + item.substr(1));
        return b.join(' ');
    }
}


