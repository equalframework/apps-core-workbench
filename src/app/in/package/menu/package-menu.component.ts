import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Component, Inject, Injector, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Menu, MenuContext, MenuItem } from './_models/Menu';
import { cloneDeep } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { WorkbenchService } from '../../_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry, IQueryParamActivator } from 'src/app/_services/query-param-activator.registry';
import { EqualComponentsProviderService } from '../../_services/equal-components-provider.service';

@Component({
    selector: 'package-menu',
    templateUrl: './package-menu.component.html',
    styleUrls: ['./package-menu.component.scss'],
})
export class PackageMenuComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public menuItem = MenuItem;
    public menuContext = MenuContext;

    public package_name: string = '';
    public menu_name: string = '';

    public menuSchema: any = '';
    public groups: string[] = [];
    public object: Menu = new Menu();
    public entities: {[id:string]:string[]} = {'model' : [], "data" : []};
    public viewList: string[] = [];

    public selected_item: MenuItem;
    public entity_fields: string[] = [];
    public isLoadingEntityData: boolean = false;
    public isRightPaneLoading: boolean = false;
    private backgroundPreloadStarted: boolean = false;

    private queryParamActivatorRegistry: QueryParamActivatorRegistry;
    private provider: EqualComponentsProviderService | null = null;

    constructor(
            private route: ActivatedRoute,
            private workbenchService: WorkbenchService,
            private location: Location,
            private matSnack: MatSnackBar,
            private dialog: MatDialog,
            private routerMemory: RouterMemory,
            private queryParamNavigator: QueryParamNavigatorService,
            private injector: Injector
            
        ) { }

    public async ngOnInit() {
        this.initializeNavigation();

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
            this.menu_name = params['menu_name'];
            this.package_name = params['package_name'];

            await this.fetchMenuData();
            void this.fetchBackgroundData();
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


    private async fetchMenuData(): Promise<void> {
        try {
            const [menuResult, coreGroupsResult] = await Promise.all([
                this.workbenchService.readMenu(this.package_name, this.menu_name).pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise(),
                this.workbenchService.getCoreGroups().pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise()
            ]);

            this.menuSchema = menuResult;
            const coreGroups = coreGroupsResult;

            this.object = new Menu(cloneDeep(this.menuSchema));
            this.groups = coreGroups.map((group: any) => group['name']);

            const modelList = await this.workbenchService.collectClasses(true).pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise();

            await this.handleQueryParamsOnce(['element'], 0);

            this.isRightPaneLoading = true;

            const dataControllers = await this.workbenchService.collectControllers('data').pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise();

            const modelEntities = modelList.map((item: string) => item.split(':')[0]);
            const dataEntities = dataControllers.map((item: string) => item.split(':')[0]);
            this.entities['model'] = modelEntities;
            this.entities['data'] = dataEntities;

            await this.handleQueryParamsOnce(['field'], 100);
            this.isRightPaneLoading = false;
        } catch (err) {
            this.isRightPaneLoading = false;
            console.error(`[MENU] Error in fetchMenuData`, err);
        }
    }

    private async handleQueryParamsOnce(elementKeys: string[], scrollDelay: number): Promise<void> {
        const queryParams = await this.route.queryParams.pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise();
        if (Object.keys(queryParams).length === 0 || !this.queryParamActivatorRegistry) {
            return;
        }
        this.queryParamNavigator.handleQueryParams(queryParams, {
            activators: this.queryParamActivatorRegistry,
            context: this,
            elementKeys,
            scrollDelay,
            scrollOptions: { behavior: 'smooth', block: 'center' }
        });
    }

    private initializeNavigation(): void {
        // Initialize the query param activators registry
        this.queryParamActivatorRegistry = new QueryParamActivatorRegistry();

        // Register activators for menu navigation
        const fieldActivator = {
            type: 'field',
            queryParamKeys: ['element', 'field'],
            canHandle: (key: string, value: any) => {
                return ['element', 'field'].includes(key);
            },
            activate: async (key: string, value: any, context: any) => {
                if (value && context.object && context.object.layout && context.object.layout.items) {
                    // Find the menu item with matching ID and select it
                    const menuItem = this.findMenuItemById(value, context.object.layout.items);
                    if (menuItem) {
                        context.selected_item = menuItem;
                        context.updateEntityDependentFields();
                    }
                }
            }
        };
        this.queryParamActivatorRegistry.register(fieldActivator);
    }

    public ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public select(event:MenuItem) {
        this.selected_item = event;
        this.updateEntityDependentFields();
    }

    /**
     * Find a menu item by ID/label in the flat item list
     * @param id The ID/label to search for
     * @param items The array of menu items to search in
     * @returns The found MenuItem or undefined
     */
    private findMenuItemById(id: string, items: MenuItem[]): MenuItem | undefined {
        return items.find(item => item.label === id);
    }

    async updateEntityDependentFields() {
        if(this.selected_item && this.selected_item.context && this.selected_item.context.entity) {
            this.viewList =   ((await this.workbenchService.collectViews(this.package_name,this.selected_item.context.entity).toPromise()).map((value => value.split(":").slice(1).join(':'))))
            this.workbenchService.getSchema(this.selected_item.context.entity.replaceAll("_", "\\"))
            .pipe(
                map(schema => Object.keys(schema.fields))
            )
            .subscribe(fields => {
                this.entity_fields = fields;
            });
                }
    }

    public goBack() {
        this.location.back();
    }

    public deleteItem(index:number) {
        this.object.layout.items.splice(index,1);
    }

    public changeContextEntity(value:string) {
        if(this.selected_item) {
            this.selected_item.context.entity = value
            this.selected_item.context.view = ''
            this.selected_item.context.domain = []
            this.selected_item.context.order = ""
            this.updateEntityDependentFields()
        }
    }

    public newItem() {
        this.object.layout.items.push(new MenuItem());
    }

    public async save() {
        let result = await this.workbenchService.saveView(this.object.export(),this.package_name,"\\menu",this.menu_name.trim()).toPromise();
        if(result) {
            this.matSnack.open("Saved successfully","INFO");
            return;
        }
        this.matSnack.open("Error during save. make sure that www-data has right on the file.","ERROR");
    }

    public showJSON() {
        this.dialog.open(JsonViewerComponent,{data:this.object.export(),width:"70%",height:"85%"});
    }

    public drop(event: CdkDragDrop<MenuItem[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        }
        else {
            transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
            );
        }
    }
}

