import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewAction } from '../../../../_objects/View';
import { ViewEditorServicesService } from '../../../../_services/view-editor-services.service';

@Component({
  selector: 'app-popup-params',
  templateUrl: './popup-params.component.html',
  styleUrls: ['./popup-params.component.scss']
})
export class PopupParamsComponent implements OnInit {

  scheme:any

  obk = Object.keys

  struct:{[id:string]:{info:any,content:any,enabled:boolean,disp:string}} = {}

  constructor(
    @Optional() public dialogRef: MatDialogRef<PopupParamsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:ViewAction,
    private api:ViewEditorServicesService
  ) { }

  async ngOnInit(){ 
    this.scheme = await this.api.doAnnounceController(this.data.controller)
    this.conStruct(this.data.params)
  }

  conStruct(params:any) {
    for(let key in this.scheme.announcement.params) {
      if(params[key]){
        this.struct[key] = {info:this.scheme.announcement.params[key],content:params[key],enabled:true,disp:""}
        this.getContent(key)
      }
      else {
        this.struct[key] = {info:this.scheme.announcement.params[key],content:undefined,enabled:false,disp:""}
      }
    }
  }

  getContent(key:string){
    if(this.struct[key].info.type === "array") {
      let arr:any[] = this.struct[key].content
      this.struct[key].disp = "[ "+arr.join(",") +" ]"
    } else {
      this.struct[key].disp =  this.struct[key].content
    }
  }

  setContent(key:string,value:string){
    if(this.struct[key].info.type === "array") {
      this.struct[key].content = value.replace(/\s/g,"").replace("[","").replace("]","").split(",")
      if(this.struct[key].content[0] === "") this.struct[key].content.splice(0,1)
    } else if(this.struct[key].info.type === "integer") {
      this.struct[key].content = Number.parseInt(value)
    } else {
      this.struct[key].content = value
    }
    this.getContent(key)
  }

  save(){
    this.data.params = {}
    for(let key in this.struct) {
      this.setContent(key,this.struct[key].disp)
      if(this.struct[key].enabled) {
        this.data.params[key] = this.struct[key].content
      }
    }
    this.dialogRef.close()
  }

  exit(){
    this.dialogRef.close()
  }
}
