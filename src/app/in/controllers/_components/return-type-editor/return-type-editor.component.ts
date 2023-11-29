import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Form, FormControl } from '@angular/forms';
import { ReturnFormatItem, ReturnValue } from './_objects/ReturnValue';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { cloneDeep } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usage } from '../params-editor/_objects/Params';
import { ActivatedRoute } from '@angular/router';
import { ControllersService } from '../../_service/controllers.service';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
  selector: 'app-return-type-editor',
  templateUrl: './return-type-editor.component.html',
  styleUrls: ['./return-type-editor.component.scss'],
  host : {
    "(body:keydown)" : "onKeydown($event)"
  }
})
export class ReturnTypeEditorComponent implements OnInit {

  onKeydown(event: KeyboardEvent) {
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.cancelOneChange()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.revertOneChange()
    }
  } 

  scheme:any

  object:ReturnValue

  error:boolean = false

  controller:string
  controller_type:string

  entities:string[]

  objectHistory:{value : ReturnValue, message:string}[] = []
  objectFutureHistory:{value : ReturnValue, message:string}[] = []

  typeControl:FormControl = new FormControl("")

  normals:string[]
  typeIconList:{[id:string]:string}

  customs:string[] = ReturnValue.customTypes

  filtered_normals:string[]
  filtered_customs:string[]

  constructor(
    private TypeUsage:TypeUsageService,
    private api:ControllersService,
    private matSnack:MatSnackBar,
    private activatedRoute:ActivatedRoute,
    private router:RouterMemory,
    private dialog:MatDialog
  ) { }

  async ngOnInit() {
    let a = this.activatedRoute.snapshot.paramMap.get("type")
    let b = this.activatedRoute.snapshot.paramMap.get("controller")
    if(!a || !b) {
      this.error = true
      return
    }
    this.controller = b
    this.controller_type = a
    this.scheme = await this.api.getAnnounceController(this.controller_type,this.controller)
    this.typeIconList = this.TypeUsage.typeIcon
    this.normals = await this.api.getTypeList()
    this.entities = await this.api.listAllModels()
    console.log(this.scheme)
    console.log(this.scheme.announcement.response)
    this.object = new ReturnValue(cloneDeep(this.scheme.announcement.response))
    this.typeControl.setValue(this.object.type)
    this.typeControl.valueChanges.subscribe(value => {
      this.filtered_normals = this._filter(value,"normals")
      this.filtered_customs = this._filter(value,"customs")
      this.changeType(value)
    })
    this.filtered_normals = this._filter("","normals")
    this.filtered_customs = this._filter("","customs")
    this.onChange("")
  }

  changeContentType(value:string) {
    this.object.contentType = value
    this.onChange("changed content-type")
  }

  changeCharset(value:string) {
    this.object.charset = value
    this.onChange("changed charset")
  }

  changeAcceptOrigin(value:any) {
    this.object.acceptOrigin = value
    this.onChange("changed accept-origin")
  }

  changeType(value:string) {
    if(!this.customs.includes(value) && !this.normals.includes(value)) return
    this.object.type = value
    this.object.entity = ""
    this.object.usage = new Usage("")
    this.object._has_values = false
    this.object.values = []
    this.onChange("Changed return type")
  }

  changeQty(value:string) {
    this.object.qty = value
    this.onChange("Changed Quantity")
  }

  changeEntity(value:string) {
    this.object.entity = value
    this.onChange("Changed Quantity")
  }

  changeHasFormat(value:boolean) {
    this.object._has_values = value
    this.onChange("toggled values")
  }

  changeFormatType(index:number,value:string) {
    this.object.values[index].type = value
    this.object.values[index].selection = []
    this.object.values[index]._has_selection = false
    this.onChange("Changed type of a field of values")
  }

  changeFormatName(index:number,value:string) {
    this.object.values[index].name = value
    this.onChange("Changed name of a field of values")
  }

  changeFormatDescription(index:number,value:string) {
    this.object.values[index].description = value
    this.onChange("Changed description of a field of values")
  }

  changeHasSelection(index:number,value:boolean) {
    this.object.values[index]._has_selection = value
    this.onChange("toggled selection")
  }


  addFormatItem() {
    this.object.values.push( new ReturnFormatItem() )
    this.onChange("Added format item")
  }

  deleteFormatItem(index:number) {
    this.object.values.splice(index,1)
    this.onChange("deleted format item")
  }

  changeSelectionItem(index:number,jndex:number,value:string) {
    this.object.values[index].selection[jndex] = value
    this.onChange("edited selection of format item "+index)
  }

  addFormatSelectionItem(index:number) {
    this.object.values[index].selection.push(undefined)
    this.onChange("Added selection item in format item "+index)
  }

  deleteFormatSelectionItem(index:number,jndex:number) {
    this.object.values[index].selection.splice(jndex,1)
    this.onChange("Added selection item in format item "+index)
  }


  protected _filter(value:string,listname:"normals"|"customs") {
    return this[listname].filter((item:string) => item.toLowerCase().includes(value.toLowerCase()))
  }

  // HISTORY PART

  public cancelOneChange() {
    if(this.lastIndex > 0) {
      let x = this.objectHistory.pop()
      if(x){
        this.objectFutureHistory.push(x)
        this.object = cloneDeep(this.objectHistory[this.lastIndex].value)

        this.resetTypeInput()

        this.matSnack.open("undone "+x.message,"INFO")
      }
    }
  }

  resetTypeInput() {
    this.typeControl.setValue(this.object.type,{emitEvent:false})
    this.filtered_normals = this._filter(this.object.type,"normals")
    this.filtered_customs = this._filter(this.object.type,"customs")
  }

  public revertOneChange() {
    if(this.objectFutureHistory.length > 0) {
      let x = this.objectFutureHistory.pop()
      if(x){
        this.objectHistory.push(x)
        this.object = cloneDeep(this.objectHistory[this.lastIndex].value)
        
        this.resetTypeInput

        this.matSnack.open("reverted "+x.message,"INFO")
      }
    }
  }

  public onChange(msg:string) {
    this.objectHistory.push({value : cloneDeep(this.object), message:msg})
    this.objectFutureHistory = []
  }

  get lastIndex():number {
    return this.objectHistory.length - 1
  }


  noCancel(event: KeyboardEvent) {
    console.log(event)
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
    }
  } 

  goBack() {
    this.router.goBack()
  }

  showJson() {
    this.dialog.open(Jsonator,{data:this.object.export(),width:"75%",height:"85%"})
  }

  save() {
    let payload = cloneDeep(this.scheme)
    payload.announcement.response = this.object.export()
    this.api.updateController(this.controller,this.controller_type,payload.announcement)
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