import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ViewItem } from '../../_objects/View';
import { Router } from '@angular/router';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

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

  equal_types:string[]
  equal_usage:any

  @Output() delete = new EventEmitter<void>();

  obk = Object.keys

  cachelist:{foreign:string,lists:{[key:string]:string},} = {foreign:"",lists:{}}

  scheme:any

  constructor(
    private api :EmbbedApiService
  ) { }

  async ngOnInit(){
    this.equal_types = ["",...(await this.api.getTypeList())]
    this.equal_usage = ["",...(await this.api.getUsageList())]
    
    if(this.item.viewtype === 1){
      this.scheme = await this.api.getSchema(this.entity)
      this.set_has_view(this.item.widgetForm._has_view)
      console.log(this.scheme)
    }
    console.log(this.equal_types)
    console.log(this.equal_usage)
  }

  onDelete() {
    this.delete.emit()
  }

  update_has_field() {
    this.set_has_view(this.item.widgetForm._has_view)
    this.set_has_header(this.item.widgetForm._has_header)
  }

  set_has_view($event:boolean) {
    if(this.item.viewtype !== 1) return
    this.item.widgetForm._has_view =  $event && this._has_viewEnabled
    if (this.item.widgetForm._has_view) {
      this.getlistOptions4View()
    }
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

