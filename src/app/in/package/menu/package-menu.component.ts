import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/router-memory.service';
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
import { JsonValidationService } from '../../_services/json-validation.service';

@Component({
    selector: 'app-package-menu',
    templateUrl: './package-menu.component.html',
    styleUrls: ['./package-menu.component.scss'],
})
export class PackageMenuComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public menuItem = MenuItem;
    public menuContext = MenuContext;

    public packageName = '';
    public menuName = '';

    public menuSchema: any = '';
    public groups: string[] = [];
    public object: Menu = new Menu();
    public entities: {[id: string]: string[]} = {'model' : [], 'data' : []};
    public viewList: string[] = [];

    public selectedItem: MenuItem;
    public entityFields: string[] = [];
    public isLoadingEntityData = false;
    public isRightPaneLoading = false;
    private backgroundPreloadStarted = false;
    public isSaving = false;

    private queryParamActivatorRegistry: QueryParamActivatorRegistry;
    private provider: EqualComponentsProviderService | null = null;

    constructor(
        private route: ActivatedRoute,
        private workbenchService: WorkbenchService,
        private location: Location,
        private dialog: MatDialog,
        private queryParamNavigator: QueryParamNavigatorService,
        private injector: Injector,
        private jsonValidationService: JsonValidationService
    ) { }

    public async ngOnInit(): Promise<void> {
        this.initializeNavigation();

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
            this.menuName = params['menu_name'];
            this.packageName = params['package_name'];

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
                this.workbenchService.readMenu(this.packageName, this.menuName).pipe(take(1), takeUntil(this.ngUnsubscribe)).toPromise(),
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
                        context.selectedItem = menuItem;
                        context.updateEntityDependentFields();
                    }
                }
            }
        };
        this.queryParamActivatorRegistry.register(fieldActivator);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public select(event: MenuItem): void {
        this.selectedItem = event;
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

    async updateEntityDependentFields(): Promise<void> {
        if (this.selectedItem && this.selectedItem.context && this.selectedItem.context.entity) {
            this.viewList = ((await this.workbenchService.collectViews(this.packageName, this.selectedItem.context.entity).toPromise())
            .map((value => value.split(':').slice(1).join(':'))));
            this.workbenchService.getSchema(this.selectedItem.context.entity.replaceAll('_', '\\'))
            .pipe(
                map(schema => Object.keys(schema.fields))
            )
            .subscribe(fields => {
                this.entityFields = fields;
            });
                }
    }

    public goBack(): void {
        this.location.back();
    }

    public deleteItem(index: number): void {
        this.object.layout.items.splice(index, 1);
    }

    public changeContextEntity(value:string): void {
        if(this.selectedItem) {
            this.selectedItem.context.entity = value;
            this.selectedItem.context.view = '';
            this.selectedItem.context.domain = [];
            this.selectedItem.context.order = '';
            this.updateEntityDependentFields();
        }
    }

    public newItem(): void {
        this.object.layout.items.push(new MenuItem());
    }

    public async save(): Promise<void> {
        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.validateBySchemaType(this.object.export(), 'menu', this.packageName),
            () => this.workbenchService.saveView(this.object.export(), this.packageName, '\\menu', this.menuName.trim()),
            (saving) => this.isSaving = saving
        );
    }

    public showJSON(): void {
        this.dialog.open(JsonViewerComponent,{data: this.object.export(), width: '70%', height: '85%'});
    }

    public drop(event: CdkDragDrop<MenuItem[]>): void {
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

