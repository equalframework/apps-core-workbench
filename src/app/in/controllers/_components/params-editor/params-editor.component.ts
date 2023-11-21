import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ControllersService } from '../../_service/controllers.service';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from './_objects/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep } from 'lodash';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { ItemTypes } from 'src/app/in/package/_constants/ItemTypes';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';


/**
 * This component has an action historic built in. 
 * Be careful if you add an element that alter the structure, you need to call onChange for the historic to work
 * 
 */
@Component({
  selector: 'app-params-editor',
  templateUrl: './params-editor.component.html',
  styleUrls: ['./params-editor.component.scss'],
  host : {
    "(body:keydown)" : "onKeydown($event)"
  }
})
export class ParamsEditorComponent implements OnInit {

  public error:boolean = false

  public paramListHistory:{param:Param[],message:string}[] = []
  public paramFutureHistory:{param:Param[],message:string}[] = []

  public scheme:any
  public controller:string = ""
  public type:string = ""
  public selectedIndex = -1

  public modelList:string[]

  paramList:Param[] = []

  public types:string[] = []
  public usages:string[] = []

  alert = alert

  public sch:any

  public type_icon:string
  public package_icon:string = ItemTypes.getIconForType('package')

  get lastIndex():number {
    return this.paramListHistory.length - 1
  }

  constructor(
    private api:ControllersService,
    private router:RouterMemory,
    private activatedRoute:ActivatedRoute,
    private matSnack:MatSnackBar,
    private dialog:MatDialog,
    private snack:MatSnackBar
  ) { }

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

  async ngOnInit(){
    this.types = ["array",...(await this.api.getTypeList())]
    this.usages = await this.api.getUsageList()
    this.types.sort((p1,p2) => p1.localeCompare(p2))
    let a = this.activatedRoute.snapshot.paramMap.get("controller")
    if(a) this.controller = a
    else this.error = true
    a = this.activatedRoute.snapshot.paramMap.get("type")
    if(a) this.type = a
    else this.error = true
    this.type_icon = ItemTypes.getIconForType(this.type)
    this.scheme = await this.api.getAnnounceController(this.type,this.controller)
    console.log(this.scheme)
    for(let key in this.scheme["announcement"]["params"]) {
        this.paramList.push(new Param(key,cloneDeep(this.scheme["announcement"]["params"][key])))
    }
    //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name)) 
    console.log(this.paramList)
    this.onChange("Opening file")
    console.log(this.toSchema())
    this.modelList = await this.api.listAllModels()
  }

  public onSelection(index:number){
    this.selectedIndex = index
  }

  public cancelOneChange() {
    if(this.lastIndex > 0) {
      let x = this.paramListHistory.pop()
      if(x){
        this.paramFutureHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("undone "+x.message,"INFO")
      }
    }
    this.toSchema()
  }

  public revertOneChange() {
    if(this.paramFutureHistory.length > 0) {
      let x = this.paramFutureHistory.pop()
      if(x){
        this.paramListHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("reverted "+x.message,"INFO")
      }

    }
    this.toSchema()
  }

  public onChange(msg:string) {
    console.log("called!")
    //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name)) 
    this.paramListHistory.push({param : cloneDeep(this.paramList), message:msg})
    this.paramFutureHistory = []
    this.paramList = [...this.paramList]
    this.toSchema()
  }

  toSchema() {
    let res:{[id:string]:any} = {}
    for(let item of this.paramList) {
      res[item.name] = item.toSchema()
    }
    this.sch = res
  }

  export():{[id:string]:any} {
    let res:{[id:string]:any} = {}
    for(let item of this.paramList) {
      res[item.name] = item.export()
    }
    let result = cloneDeep(this.scheme)
    result["announcement"]["params"] = res
    return result["announcement"]
  }

  showJson() {
    this.dialog.open(Jsonator,{data:this.export(),width:"75%",height:"85%"})
  }

  handleCustomButton(name:string) {
    console.log(name)
    if(name === "show JSON") {
      this.showJson()
      return
    }
  }

  goBack() {
    this.router.goBack()
  }

  async save() {
    this.snack.open("Saving...","INFO")
    let result = await this.api.updateController(this.controller,this.type,this.export())
    if(result) {
      this.snack.open("Saved !","INFO")
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