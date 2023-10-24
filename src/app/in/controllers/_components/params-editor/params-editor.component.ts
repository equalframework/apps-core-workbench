import { Component, OnInit } from '@angular/core';
import { ControllersService } from '../../_service/controllers.service';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from './_objects/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep } from 'lodash';
import { TypeUsageService } from 'src/app/_services/type-usage.service';


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

  paramList:Param[] = []

  public types:string[] = []
  public usages:string[] = []

  alert = alert

  get lastIndex():number {
    return this.paramListHistory.length - 1
  }

  constructor(
    private api:ControllersService,
    private router:RouterMemory,
    private activatedRoute:ActivatedRoute,
    private matSnack:MatSnackBar,
  ) { }

  onKeydown(event: KeyboardEvent) {
    if( event.key === "z" && event.ctrlKey) {
      this.cancelOneChange()
    }
    if( event.key === "y" && event.ctrlKey) {
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
    this.scheme = await this.api.getAnnounceController(this.type,this.controller)
    console.log(this.scheme)
    for(let key in this.scheme["announcement"]["params"]) {
        this.paramList.push(new Param(key,this.scheme["announcement"]["params"][key]))
    }
    //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name)) 
    console.log(this.paramList)
    this.onChange("Opening file")
  }

  public onSelection(index:number){
    this.selectedIndex = index
  }

  protected cancelOneChange() {
    if(this.lastIndex > 0) {
      let x = this.paramListHistory.pop()
      if(x){
        this.paramFutureHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("undone "+x.message,"INFO")
      }

    }
  }

  protected revertOneChange() {
    if(this.paramFutureHistory.length > 0) {
      let x = this.paramFutureHistory.pop()
      if(x){
        this.paramListHistory.push(x)
        this.paramList = cloneDeep(this.paramListHistory[this.lastIndex].param)
        this.matSnack.open("reverted "+x.message,"INFO")
      }

    }
  }

  public onChange(msg:string) {
    console.log("called!")
    //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name)) 
    this.paramListHistory.push({param : cloneDeep(this.paramList), message:msg})
    this.paramFutureHistory = []
    this.paramList = [...this.paramList]
  }

}
