import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { View, ViewGroup, ViewItem, ViewSection } from './_objects/View';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { ViewEditorServicesService } from './_services/view-editor-services.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  loading = true

  // this is used to avoid calling the compliancy_id method which has a great cost
  compliancy_cache:{ok:boolean,id_list:string[]} 

  domain_visible = false
  filter_visible = false
  layout_visible = true
  header_visible = false
  header_action_visible = false
  header_selection_action_visible = false
  actions_visible = false

  groups:string[] = []
  groups_visible:{[id:number]:boolean} = {}

  collect_controller:string[] = ["core_model_collect"];

  action_controllers:string[]
  

  constructor(
    private router:RouterMemory,
    private activatedroute:ActivatedRoute,
    private api:ViewEditorServicesService,
    private popup:MatDialog,
    private snackBar:MatSnackBar
  ) { }

  async ngOnInit() {
    this.name = this.activatedroute.snapshot.paramMap.get("view_name")
    await this.init();
    this.loading = false
  }

  public async init() {
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
    this.api.getCoreGroups().then(data => {
      for(let key in data) {
        this.groups.push(data[key]['name'])
      }
      console.log(this.groups)
    })
  }

  ngOnChanges() {
  }

  // Call id_compliant method on view_obj and cache it
  get idCompliancy():{ok:boolean,id_list:string[]} {
    this.compliancy_cache =  this.view_obj.id_compliant([])
    return this.compliancy_cache
  }

  // Look for ids doublons in compliancy_cache
  get idDoublons() {
    const filtered = this.compliancy_cache.id_list.filter((item, index) => this.compliancy_cache.id_list.indexOf(item) !== index);
    return filtered.join(",")
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

  save() {
    
    var timerId = setTimeout(async () => {
      this.api.saveView(this.view_obj.export(),this.entity,this.view_id);
      this.snackBar.open("Saved ! Change can take time to be ", '', {
          duration: 1000,
          horizontalPosition: 'left',
          verticalPosition: 'bottom'
      })
      this.router.goBack();
    }, 1500);
    this.snackBar.open("Saving...", 'Cancel', {
        duration: 1500,
        horizontalPosition: 'left',
        verticalPosition: 'bottom'
    }).onAction().subscribe(() => {
        clearTimeout(timerId);
    })
  }

  cancel() {
    var timerId = setTimeout(async () => {
      await this.init()
      this.snackBar.open("Changes canceled", '', {
          duration: 1000,
          horizontalPosition: 'left',
          verticalPosition: 'bottom'
      })
    }, 1500);
    this.snackBar.open("Canceling...", 'Cancel', {
        duration: 1500,
        horizontalPosition: 'left',
        verticalPosition: 'bottom'
    }).onAction().subscribe(() => {
        clearTimeout(timerId);
    })
  }
}


// This component is used to have a preview of the json file (mostly for debug reasons)
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
    return prettyPrintJson.toHtml(this.data,{indent:2,quoteKeys:true})
  }

  onClick(): void {
    this.dialogRef.close();
  }
}