import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ViewItem } from '../../_objects/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {
    @Input() item:ViewItem
    @Input() entity:string
    @Input() fields:string[]
    @Input() types:string[]
    @Input() displayDelete:boolean = false
    @Input() groups:string[]
    @Input() action_controllers:string[]

    protected widget_types:{[id:string]:string[]};
    public filtered_equal_usage:string[];

    @Output() delete = new EventEmitter<void>();

    obk = Object.keys

    public cachelist:{foreign:string,lists:{[key:string]:string},} = {foreign:"",lists:{}};

    public scheme:any;

    constructor(
            private api: WorkbenchService) {

    }

  async ngOnInit(){
    this.widget_types = await this.api.getWidgetTypes()
    this.scheme = await this.api.getSchema(this.entity)
    if(this.item.viewtype === 1){
      this.set_has_view(this.item.widgetForm._has_view)
    }
  }

  get widgetTypes():string[] {
    if(this.item.type === "label") return [""]
    if(!Object.keys(this.widget_types).includes((this.scheme.fields[this.item.value].type))) return [""]
    return ["",...this.widget_types[this.scheme.fields[this.item.value].type]]
  }

  public onDelete() {
    this.delete.emit()
  }

  public update_has_field() {
    this.set_has_view(this.item.widgetForm._has_view)
    this.set_has_domain(this.item.widgetForm._has_view)
    this.set_has_header(this.item.widgetForm._has_header)
  }

  public set_has_view($event:boolean) {
    if(this.item.viewtype !== 1) return
    this.item.widgetForm._has_view =  $event && this._has_viewEnabled
    if (this.item.widgetForm._has_view) {
      this.getlistOptions4View()
    }
  }

  set_has_domain($event:boolean) {
    if(this.item.viewtype !== 1) return
    this.item.widgetForm._has_domain = $event && this._has_viewEnabled
  }

  set_has_header($event:boolean) {
    if(this.item.viewtype !== 1) return
    this.item.widgetForm._has_header =  $event && this._has_viewEnabled
  }

  get _has_viewEnabled() {
    if(this.item.viewtype !== 1) return false
    return this.item.type === "field" && this.scheme['fields'] && (
      this.scheme['fields'][this.item.value]['type'] === "many2many" || 
      this.scheme['fields'][this.item.value]['type'] === "one2many" ||
      this.scheme['fields'][this.item.value]['type'] === "many2one" 
    ) 
  }

  get fieldType():string {
    if(this.item.type === "label") return "string"
    if(this.scheme['fields'][this.item.value]['type'] === "computed") return this.scheme['fields'][this.item.value]['result_type']
    return this.scheme['fields'][this.item.value]['type']
  }

  async getlistOptions4View(){
    if(this.item.viewtype !== 1) return
    console.log(this.scheme['fields'][this.item.value]['foreign_object']===this.cachelist.foreign)
    if(this._has_viewEnabled && this.scheme['fields'][this.item.value]['foreign_object'] === this.cachelist.foreign ) {
      return 
    }
    let t = this.scheme['fields'][this.item.value]['foreign_object'].split("\\")
    let x =  (await this.api.listViewFrom(t[0],t.slice(1).join("\\")))?.filter((value) => value.includes('list.'))
    if(x){
      let r:{[key:string]:string}= {}
      x.forEach(list => r[list.split(":")[1]] = list)
      this.cachelist = {
        foreign : this.scheme['fields'][this.item.value]['foreign_object'],
        lists : r,
      }
      return
    }

    this.cachelist = {
      foreign : this.scheme['fields'][this.item.value]['foreign_object'],
      lists : {},
    }
  }
}

