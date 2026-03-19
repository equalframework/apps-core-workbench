import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Menu, MenuContext, MenuItem } from './_models/Menu';
import { cloneDeep } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { WorkbenchService } from '../../_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry, IQueryParamActivator } from 'src/app/_services/query-param-activator.registry';

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

    private queryParamActivatorRegistry: QueryParamActivatorRegistry;

    constructor(
            private route: ActivatedRoute,
            private workbenchService: WorkbenchService,
            private location: Location,
            private matSnack: MatSnackBar,
            private dialog: MatDialog,
            private routerMemory: RouterMemory,
            private queryParamNavigator: QueryParamNavigatorService
        ) { }

    public async ngOnInit() {
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

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.menu_name = params['menu_name'];
            this.package_name = params['package_name'];
            // Getting the menu as a view json
            this.workbenchService.readMenu(this.package_name,this.menu_name).subscribe(async menuSchema => {
                this.menuSchema = menuSchema;
                // Parsing the json as an Menu object
            // #memo - we clone the schema to avoid the Menu constructor to destroy the original copy
            console.log("Menu schema : ", this.menuSchema);
            this.object = new Menu(cloneDeep(this.menuSchema));
            this.entities['model'] = await this.workbenchService.collectClasses(true).toPromise();
            this.entities['data'] = await this.workbenchService.collectControllers('data').toPromise();
            this.workbenchService.getCoreGroups().toPromise().then(data => {
                for(let key in data) {
                    this.groups.push(data[key]['name'])
                }
                // Handle URL query parameters for deep linking to specific tabs or sections
                this.route.queryParams.subscribe(params => {
                    if (Object.keys(params).length > 0 && this.queryParamActivatorRegistry) {
                        this.queryParamNavigator.handleQueryParams(params, {
                            activators: this.queryParamActivatorRegistry,
                            context: this,
                            elementKeys: ['element', 'field'],
                            scrollDelay: 0,
                            scrollOptions: { behavior: 'smooth', block: 'center' }
                        });
                    }
                });
            });
            })


        });


    }

    public ngOnDestroy() {
        console.debug('PackageMenuComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public select(event:MenuItem) {
        this.selected_item = event;
        console.log(this.selected_item);
        this.updateEntityDependentFields();
        console.log(this.viewList);
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
        if(this.selected_item) {
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
        console.log("package_name : ", this.package_name);
        console.log("menu_name : ", this.menu_name);
        console.log("Object exporte : ", this.object.export());
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

