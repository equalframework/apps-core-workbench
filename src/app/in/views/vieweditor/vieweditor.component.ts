import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ViewService } from '../_services/view.service';
import { View, ViewGroup, ViewItem, ViewSection } from './_objects/View';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { ViewEditorServicesService } from './_services/view-editor-services.service';

@Component({
  selector: 'app-vieweditor',
  templateUrl: './vieweditor.component.html',
  styleUrls: ['./vieweditor.component.scss']
})
export class VieweditorComponent implements OnInit {

  view_id:string;
  entity:string;
  view_scheme:any;
  obk = Object.keys;
  view_obj:View
  name:string|null
  class_scheme:any
  fields:string[]
  types = ViewItem.typeList

  domain_visible = false
  filter_visible = false
  layout_visible = true
  groups_visible:{[id:number]:boolean} = {}

  collect_controller:string[] = ["core_model_collect"];

  action_controllers:string[]
  

  constructor(
    private router:RouterMemory,
    private activatedroute:ActivatedRoute,
    private api:ViewEditorServicesService,
    private popup:MatDialog,
  ) { }

  async ngOnInit() {
    this.name = this.activatedroute.snapshot.paramMap.get("view_name")
    if(this.name) {
      let tempsplit = this.name.split(":")
      this.entity = tempsplit[0]
      this.view_id = tempsplit[1]
      this.view_scheme = await this.api.getView(this.entity,this.view_id)
      console.log(this.view_scheme)
      this.view_obj = new View(this.view_scheme,tempsplit[1].split(".")[0])
      console.log(this.view_obj)
      this.class_scheme = await this.api.getSchema(this.entity)
      this.fields = this.obk(this.class_scheme['fields'])
      console.log(this.fields)
      for(let num in this.view_obj.layout.groups) {
        this.groups_visible[num] = false
      }
      let temp_controller = await this.api.getDataControllerList(this.entity.split("\\")[0])
      for(let item of temp_controller) {
        let data =  await this.api.getAnnounceController(item)
        if(!data) continue
        if(!data["announcement"]["extends"] || data["announcement"]["extends"] !== "core_model_collect") continue
        this.collect_controller.push(item)
      }
      console.log(this.collect_controller)
      this.action_controllers = await this.api.getAllActionControllers()
    }
  }

  ngOnChanges() {
    console.log(this.collect_controller)
  }

  addItemLayout() {
    this.view_obj.layout.newViewItem()
  }

  addFilter() {
    this.view_obj.addFilter()
    this.filter_visible = true
  }

  deleteItemLayout(index:number) {
    this.view_obj.layout.deleteItem(index)
  }

  deleteFilter(index:number) {
    this.view_obj.deleteFilter(index)
  } 

  logit() {
    console.log(this.view_obj)
    this.popup.open(DialogOverviewExampleDialog,{data:this.view_obj.export()})
  }
  
  addGroup() {
    this.view_obj.layout.groups.push(new ViewGroup({"label":"New Group"}))
    for(let num in this.view_obj.layout.groups) {
      if(!this.groups_visible[num]) this.groups_visible[num] = false
    }
  }

  goBack() {
    this.router.goBack()
  }

  deleteGroup(index:number){
    this.view_obj.layout.groups.splice(index,1)
  }

  addSection(index:number) {
    this.view_obj.layout.groups[index].sections.push(new ViewSection({"label":"new section"}))
  }
}


@Component({
  selector: 'dialog-overview-example-dialog',
  template:"<style>pre{overflow-y : scroll; font-size: .8em; height: 50em; width: 80em;}</style><pre  [innerHTML]='datahtml'></pre>"
})
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data:any,
  ) {
    console.log(data)
  }

  get datahtml() {
    return prettyPrintJson.toHtml(this.data)
  }

  onClick(): void {
    this.dialogRef.close();
  }
}