import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { Menu, MenuContext, MenuItem } from '../_object/Menu';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewEditorServicesService } from '../../views/vieweditor/_services/view-editor-services.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-menu-editor',
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit {
    public menuItem = MenuItem;
    public menuContext = MenuContext;
    public packageName:string = '';
    public menuName:string = '';
    public menuSchema:any = '';
    public groups:string[] = [];
    public object:Menu = new Menu();
    public entities:{[id:string]:string[]} = {'model' : [], "data" : []};
    public viewlist:string[] = [];

    public selected_item:MenuItem;
    public entity_fields:string[] = [];

    constructor(
        private activatedRoute:ActivatedRoute,
        private api:ViewEditorServicesService,
        private router:RouterMemory,
        private matSnack:MatSnackBar,
        private dialog:MatDialog
    ) { }

    async ngOnInit(){
        // Retrieving the name of the menu and his package from the url
        let a = this.activatedRoute.snapshot.paramMap.get('menu_name');
        this.menuName = a ? a : "";
        a = this.activatedRoute.snapshot.paramMap.get('package_name');
        this.packageName = a ? a : "";

        // Getting the menu as a view json
        this.menuSchema = await this.api.getView(this.packageName+"\\menu",this.menuName);

        // Parsing the json as an Menu object
        // We clone the schema to avoid the Menu constructor to destroy the original copy
        this.object = new Menu(cloneDeep(this.menuSchema));
        this.entities['model'] = await this.api.listAllModels();
        this.entities['data'] = await this.api.listControllersByType('data');

        this.api.getCoreGroups().then(data => {
                for(let key in data) {
                    this.groups.push(data[key]['name'])
                }
            });
    }

    public select(event:MenuItem) {
        this.selected_item = event;
        console.log(this.selected_item);
        this.updateEntityDependentFields();
        console.log(this.viewlist);
    }

    async updateEntityDependentFields() {
        if(this.selected_item) {
            this.viewlist =   ((await this.api.getViews('entity',this.selected_item.context.entity)).map((value => value.split(":").slice(1).join(':'))))
            this.entity_fields = Object.keys((await this.api.getSchema(this.selected_item.context.entity.replaceAll("_","\\")))['fields'])
        }
    }

    public goBack() {
        this.router.goBack();
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
        let result = await this.api.saveView(this.object.export(),this.packageName+"\\menu",this.menuName);
        if(result) {
            this.matSnack.open("Saved successfully","INFO");
            return;
        }
        this.matSnack.open("Error during save. make sure that www-data has right on the file.","ERROR");
    }

    public showJSON() {
        this.dialog.open(Jsonator,{data:this.object.export(),width:"70%",height:"85%"});
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
