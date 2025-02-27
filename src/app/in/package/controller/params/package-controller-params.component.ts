import { Location } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { Param } from '../../../_models/Params';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep } from 'lodash';
import { ItemTypes } from 'src/app/in/_models/item-types.class';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


/**
 * Component used to display the component of a package (using `/package/:package_name/controller/:controller_type/:controller_name/params` route)
 * This component has an action historic built in.
 * Be careful if you add an element that alter the structure, you need to call onChange for the historic to work
 *
 */
@Component({
  selector: 'package-controller-params',
  templateUrl: './package-controller-params.component.html',
  styleUrls: ['./package-controller-params.component.scss'],
  host : {
    "(body:keydown)" : "onKeydown($event)"
  }
})
export class PackageControllerParamsComponent implements OnInit {

    public error:boolean = false;

    public paramListHistory:{param:Param[],message:string}[] = [];
    public paramFutureHistory:{param:Param[],message:string}[] = [];

    public scheme:any;
    public controller_name:string = '';
    public controller_type:string = '';
    public selectedIndex = -1;

    public modelList:string[];

    public paramList:Param[] = [];

    public types:string[] = [];
    public usages:string[] = [];

    public alert = alert;

    public sch:any;

    public type_icon:string;
    public package_icon:string = ItemTypes.getIconForType('package');

    get lastIndex():number {
        return this.paramListHistory.length - 1;
    }

    constructor(
            private workbenchService: WorkbenchService,
            private location: Location,
            private activatedRoute: ActivatedRoute,
            private matSnack:MatSnackBar,
            private dialog: MatDialog,
            private snack: MatSnackBar,
            private notificationService: NotificationService
        ) { }

    public onKeydown(event: KeyboardEvent) {
        if( event.key === "z" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.cancelOneChange();
        }
        if( event.key === "y" && event.ctrlKey) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.revertOneChange();
        }
    }

    public async ngOnInit(){
        this.types = ["array",...(await this.workbenchService.getTypeList())]
        this.usages = await this.workbenchService.getUsageList()
        this.types.sort((p1,p2) => p1.localeCompare(p2))
        let a = this.activatedRoute.snapshot.paramMap.get('controller_name')
        if(a) {
            this.controller_name = a;
        }
        else {
            this.error = true;
        }
        a = this.activatedRoute.snapshot.paramMap.get('controller_type');
        if(a) {
            this.controller_type = a;
        }
        else {
            this.error = true;
        }
        this.type_icon = ItemTypes.getIconForType(this.controller_type);
        this.scheme = await this.workbenchService.announceController(this.controller_type,this.controller_name).toPromise();
        console.log(this.scheme);
        for(let key in this.scheme["announcement"]["params"]) {
            this.paramList.push(new Param(key,cloneDeep(this.scheme["announcement"]["params"][key])));
        }
        //this.paramList =  this.paramList.sort((p1,p2) => p1.name.localeCompare(p2.name))
        console.log(this.paramList);
        this.onChange("Opening file");
        console.log(this.toSchema());
        this.modelList = await this.workbenchService.collectClasses(true).toPromise();
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
    this.location.back()
  }

save() {
    this.snack.open("Saving...","INFO")
    this.workbenchService.updateController(this.controller_name, this.controller_type, this.export()).subscribe((result) => {
            if(result.success){
                    this.notificationService.showSuccess(result.message)
            } else{
                this.notificationService.showError(result.message);
            }
    })

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