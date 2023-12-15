import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
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
  menuItem = MenuItem;
  menuContext = MenuContext;

  packageName:string = ''

  menuName:string = ''
  menuSchema:any = ''

  groups:string[] = []

  object:Menu = new Menu()

  entities:{[id:string]:string[]} = {'model' : [], "data" : []}

  viewlist:string[] = []

  selected_item:MenuItem|undefined = undefined

  entity_fields:string[] = []

  constructor(
    private activatedRoute:ActivatedRoute,
    private api:ViewEditorServicesService,
    private router:RouterMemory,
    private matSnack:MatSnackBar,
    private dialog:MatDialog
  ) { }

  async ngOnInit(){
    // Retrieving the name of the menu and his package from the url
    let a = this.activatedRoute.snapshot.paramMap.get('menu_name')
    this.menuName = a ? a : ""
    a = this.activatedRoute.snapshot.paramMap.get('package_name')
    this.packageName = a ? a : ""

    // Getting the menu as a view json
    this.menuSchema = await this.api.getView(this.packageName+"\\menu",this.menuName)
    console.log(this.menuSchema)

    // Parsing the json as an Menu object
    // We clone the schema to avoid the Menu constructor to destroy the original copy
    this.object = new Menu(cloneDeep(this.menuSchema))
    console.log(this.object)
    this.entities['model'] = await this.api.listAllModels()
    this.entities['data'] = await this.api.listControllersByType('data')

    this.api.getCoreGroups().then(data => {
      for(let key in data) {
        this.groups.push(data[key]['name'])
      }
    })
  }

  select(event:MenuItem) {
    this.selected_item = event
    console.log(this.selected_item)
    this.updateEntityDependentFields()
    console.log(this.viewlist)
  }

  async updateEntityDependentFields() {
    if(this.selected_item) {
      this.viewlist =   ((await this.api.getViews('entity',this.selected_item.context.entity)).map((value => value.split(":").slice(1).join(':'))))
      this.entity_fields = Object.keys((await this.api.getSchema(this.selected_item.context.entity.replaceAll("_","\\")))['fields'])
    }
  }

  goBack() {
    this.router.goBack()
  }

  deleteItem(index:number) {
    this.object.layout.items.splice(index,1)
  }

  changeContextEntity(value:string) {
    if(this.selected_item) {
      this.selected_item.context.entity = value
      this.selected_item.context.view = ''
      this.selected_item.context.domain = []
      this.selected_item.context.order = ""
      this.updateEntityDependentFields()
    }
  }

  public newItem() {
    this.object.layout.items.push(new MenuItem())
  }

  async save() {
    let result = await this.api.saveView(this.object.export(),this.packageName+"\\menu",this.menuName)
    if(result) {
      this.matSnack.open("Saved successfully !","INFO")
      return
    }
    this.matSnack.open("Error during save. make sure that www-data has right on the file.","ERROR")
  }

  showJSON() {
    this.dialog.open(Jsonator,{data:this.object.export(),width:"70%",height:"85%"})
  }
  
  drop(event: CdkDragDrop<MenuItem[]>) {
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
