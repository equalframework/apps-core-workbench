import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
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

    isDomainVisible = false;
    isFilterVisible = false;
    isLayoutVisible = true;
    isHeaderVisible = false;
    isHeaderActionVisible = false;
    isHeaderSelectionActionVisible = false;
    isActionsVisible = false;
    isRoutesVisible = false;
    isAccessVisible = false;

    groups: string[] = [];

    icontype: { [id: string]: string };

    collect_controller: string[] = ["core_model_collect"];
    action_controllers: string[];

    constructor(
        private route: ActivatedRoute,
        private workbenchService: WorkbenchService,
        private popup: MatDialog,
        private snackBar: MatSnackBar,
        private TypeUsage: TypeUsageService,
        private location: Location,
        private provider:EqualComponentsProviderService,
        private notificationService: NotificationService,
        private routerMemory: RouterMemory
    ) { }

    async ngOnInit() {
        await this.init();
    }

    async init() {
        // Extract parameters from the route
        const package_name = this.route.snapshot.paramMap.get('package_name');
        const entityView = this.route.snapshot.params['entity_view'];
        const [entityName, rest] = entityView.split(':');   // ['Post', 'default.form']
        const [viewName, viewType] = rest.split('.');        // ['default', 'form']

        this.icontype = this.TypeUsage.typeIcon;
        console.log("Route", this.route);
        console.log("Route params:", { package_name, entityName, viewType, viewName });

        if (package_name && entityName && viewType && viewName) {
            this.name = viewName;
            this.entity = entityName;
            this.viewId = viewType + "." + viewName;

            console.log("Fetching component with parameters:", { viewType, viewName });

            this.provider.getComponent(package_name, 'view', this.entity, (this.entity + ":" + this.viewId)).subscribe(async (compo) => {
                if (compo) {
                    this.node = compo;
                    try {
                        this.class_scheme = await this.workbenchService.getSchema(`${this.node.package_name}\\${this.entity}`).toPromise() || { fields: {} };
                        this.fields = this.obk(this.class_scheme.fields);
                        this.viewScheme = (await this.workbenchService.readView(this.node.package_name, this.viewId, this.entity).toPromise());
                        const nodeNameParts = this.node.name ? this.node.name.split(':') : [];
                        const viewNamePart = (nodeNameParts.length > 1 && nodeNameParts[1])
                            ? nodeNameParts[1].split('.')[0]
                            : '';
                        this.viewObj = new View(this.viewScheme, viewNamePart);

                        let temp_controller = await this.workbenchService.collectControllers('data', package_name).toPromise();
                        for (let item of temp_controller) {
                            let data = await this.workbenchService.announceController(item).toPromise();
                            if (!data) continue;
                            if (!data["announcement"]["extends"] || data["announcement"]["extends"] !== "core_model_collect") continue;
                            this.collect_controller.push(item);
                        }

                        this.action_controllers = await this.workbenchService.collectControllers('actions').toPromise();
                        this.workbenchService.getCoreGroups().toPromise().then(data => {
                            for (let key in data) {
                                this.groups.push(data[key]['name']);
                            }
                        });
                        this.loading = false;
                    } catch (err) {
                        this.error = true;
                        this.loading = false;
                    }
                } else {
                    console.warn('Component not found.');
                    this.loading = false;
                }
            });
        }
    }

    ngOnChanges() {
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

    addItemLayout() {
        this.viewObj.layout.newViewItem();
    }

    addFilter() {
        this.viewObj.addFilter();
        this.isFilterVisible = true;
    }

    deleteItemLayout(index:number) {
        this.viewObj.layout.deleteItem(index);
    }

    deleteFilter(index:number) {
        this.viewObj.deleteFilter(index);
    }

    logit() {
        this.popup.open(JsonViewerComponent,{data:this.viewObj.export(),width:"70%",height:"85%"});
    }

    addGroup() {
        this.viewObj.layout.groups.push(new ViewGroup({"label":"New Group"}));
    }

    goBack() {
        this.location.back();
    }

    deleteGroup(index:number){
        this.viewObj.layout.groups.splice(index,1);
    }

    addSection(index:number) {
        this.viewObj.layout.groups[index].sections.push(new ViewSection({"label":"new section"}));
    }

    save() {
        this.workbenchService.saveView(this.viewObj.export(),this.node.package_name, this.entity,this.viewId).subscribe((result )=>{
            if(result.success){
                this.notificationService.showSuccess(result.message);
            }else{
                this.notificationService.showError(result.message);
            }
        });
    }

    cancel() {
        var timerId = setTimeout(async () => {
            await this.init();
            this.snackBar.open("Changes canceled", '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }, 1500);
        this.snackBar.open("Canceling...", 'Cancel', {
            duration: 1500,
            horizontalPosition: 'left',
            verticalPosition: 'bottom'
        }).onAction().subscribe(() => {
            clearTimeout(timerId);
        });
    }

    drop_item(event: CdkDragDrop<ViewItem[]>) {
        console.log(event);
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }

    handleCustomButton(name:string) {
        if(name === "Show JSON"){
            this.logit();
            return;
        }
    }

    fieldList(operation:ViewOperation,field:string):string[] {
        let b:string[] = [field];
        b.push(...Object.keys(this.class_scheme.fields).filter( (item:string) => !operation.fieldTaken.includes(item)));
        return b;
    }

    addOperation() {
        this.viewObj.operations.push(new ViewOperation({},""));
    }

    addOp(index:number) {
        this.viewObj.operations[index].ops.push({
            name : "",
            usage: new Usage(""),
            operation: "COUNT",
            prefix: "",
            suffix: "",
            leftover: {},
        });
    }

    delOperation(index:number) {
        this.viewObj.operations.splice(index,1);
    }

    delOp(index:number,jndex:number) {
        this.viewObj.operations[index].ops.splice(jndex,1);
    }

    addNewGroupBy() {
        this.viewObj.groupBy.items.push(new ViewGroupByItem());
    }

    deleteGroupBy(index:number) {
        this.viewObj.groupBy.items.splice(index,1);
    }

    ToNameDisp(name:string):string {
        const a = name.replaceAll("_"," ");
        let b = a.split(" ").map(item => {return item.charAt(0).toUpperCase() + item.substr(1)});
        return b.join(" ");
    }
}

