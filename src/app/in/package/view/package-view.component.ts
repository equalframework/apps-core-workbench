import { Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
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

@Component({
    selector: 'package-view',
    templateUrl: './package-view.component.html',
    styleUrls: ['./package-view.component.scss']
})
export class PackageViewComponent implements OnInit {

    viewId: string;
    entity: string;
    private componentId = 'view-layout-tab-layout-editor';

    viewScheme: any;
    obk = Object.keys;
    viewObj: View = new View({ layout: { items: [] }, operations: [], groupBy: { items: [] } }, '');
    name: string = "";
    node: EqualComponentDescriptor;

    types = ViewItem.typeList;
    loading = true;
    error = false;

    class_scheme: any = { fields: {} };
    fields: string[] = [];

    compliancy_cache: { ok: boolean, id_list: string[] };
    groups: string[] = [];
    icontype: { [id: string]: string };

    collect_controller: string[] = ["core_model_collect"];
    action_controllers: string[];

    // Tab management
    selectedTabIndex: number = 0;
    private tabNameToIndexMap: { [key: string]: number } = {
      'layout': 0,
      'header': 1,
      'actions': 2,
      'routes': 3,
      'advanced': 4
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
        private provider:EqualComponentsProviderService,
        private notificationService: NotificationService,
        private routerMemory: RouterMemory,
        private queryParamNavigator: QueryParamNavigatorService,
    ) { }

    async ngOnInit() {
        this.initializeNavigation();
        
        await this.init();
    }

    async init() {
        this.loading = true;
        this.error = false;
        this.collect_controller = ["core_model_collect"];
        this.action_controllers = [];
        this.groups = [];

        const package_name = this.route.snapshot.paramMap.get('package_name');
        const entityView = this.route.snapshot.params['entity_view'];
        const [entityName, rest] = entityView.split(':');
        const [viewType, viewName] = rest.split('.');

        this.icontype = this.TypeUsage.typeIcon;

        if (!package_name || !entityName || !viewType || !viewName) return;

        this.name = viewName;
        this.entity = entityName;
        this.viewId = viewType + "." + viewName;

        try {
            // Phase 1 : données essentielles chargées en parallèle
            const [compo, schema, viewScheme] = await Promise.all([
                this.provider.getComponent(package_name, 'view', this.entity, (this.entity + ":" + this.viewId)).toPromise(),
                this.workbenchService.getSchema(`${package_name}\\${entityName}`).toPromise(),
                this.workbenchService.readView(package_name, this.viewId, entityName).toPromise()
            ]);

            if (!compo) {
                console.warn('Component not found.');
                this.loading = false;
                return;
            }

            this.node = compo;
            this.class_scheme = schema || { fields: {} };
            this.fields = this.obk(this.class_scheme.fields);
            this.viewScheme = viewScheme;

            const nodeNameParts = this.node.name ? this.node.name.split(':') : [];
            const viewNamePart = (nodeNameParts.length > 1 && nodeNameParts[1])
                ? nodeNameParts[1].split('.')[0]
                : '';
            this.viewObj = new View(this.viewScheme, viewNamePart);

            // Afficher l'UI dès que les données essentielles sont prêtes
            this.loading = false;

            // Souscription aux query params (après chargement)
            this.route.queryParams.subscribe(params => {
                if (Object.keys(params).length > 0 && this.queryParamActivatorRegistry) {
                    this.queryParamNavigator.handleQueryParams(params, {
                        activators: this.queryParamActivatorRegistry,
                        context: this,
                        elementKeys: ['element'],
                        scrollDelay: 100
                    });
                }
            });

            // Phase 2 : données secondaires chargées en arrière-plan (non bloquant)
            this.loadSecondaryData(package_name);
        } catch (err) {
            this.error = true;
            this.loading = false;
        }
    }

    private async loadSecondaryData(package_name: string): Promise<void> {
        try {
            const [temp_controllers, action_controllers, groupsData] = await Promise.all([
                this.workbenchService.collectControllers('data', package_name).toPromise(),
                this.workbenchService.collectControllers('actions').toPromise(),
                this.workbenchService.getCoreGroups().toPromise()
            ]);

            const announcements = await Promise.all(
                temp_controllers.map(item => this.workbenchService.announceController(item).toPromise())
            );
            for (let i = 0; i < temp_controllers.length; i++) {
                const data = announcements[i];
                if (!data) continue;
                if (!data["announcement"]["extends"] || data["announcement"]["extends"] !== "core_model_collect") continue;
                this.collect_controller.push(temp_controllers[i]);
            }

            this.action_controllers = action_controllers;
            for (const key in groupsData) {
                this.groups.push(groupsData[key]['name']);
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
    get idCompliancy():{ok:boolean,id_list:string[]} {
        this.compliancy_cache =  this.viewObj.id_compliant([]);
        return this.compliancy_cache;
    }

    // Look for ids doublons in compliancy_cache
    get idDoublons() {
        const filtered = this.compliancy_cache.id_list.filter((item, index) => this.compliancy_cache.id_list.indexOf(item) !== index);
        return filtered.join(",");
    }

    logit() {
        this.popup.open(JsonViewerComponent,{data:this.viewObj.export(),width:"70%",height:"85%"});
    }

    goBack() {
        this.location.back();
    }

    save() {
        this.workbenchService.saveView(this.viewObj.export(),this.node.package_name, this.entity,this.viewId).subscribe((result )=>{
            if(result.success){
                this.notificationService.showSuccess(result.message);
            }else{
                this.notificationService.showError(result.message);
            }
        );
    }

    cancel() {
        var timerId = setTimeout(async () => {
            await this.init();
            this.snackBar.open("Changes canceled", '', {
                duration: 1000,
            });
        }, 0);
    }

    handleCustomButton(name:string) {
        if(name === "Show JSON"){
            this.logit();
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

    ToNameDisp(name:string):string {
        const a = name.replaceAll("_"," ");
        let b = a.split(" ").map(item => {return item.charAt(0).toUpperCase() + item.substr(1)});
        return b.join(" ");
    }
}


