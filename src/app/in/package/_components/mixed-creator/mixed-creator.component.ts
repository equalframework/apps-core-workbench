import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemTypes } from '../../_constants/ItemTypes';
import { AbstractControl, AsyncValidatorFn, FormControl, MaxLengthValidator, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-mixed-creator',
  templateUrl: './mixed-creator.component.html',
  styleUrls: ['./mixed-creator.component.scss']
})
export class MixedCreatorComponent implements OnInit {
  public t_dict = ItemTypes.trueTypeDict
  public type: string
  public obk: Function = Object.keys
  cachelist: string[] | undefined = undefined
  cachepkglist: string[] | undefined = undefined
  cachemodellist: string[] | undefined = undefined
  selected_package:string = ""
  selected_model:string = ""
  implemented:boolean = true
  protected subtypename:string = ""

  lockType:boolean
  lockPackage:boolean
  lockModel:boolean
  lockSubType:boolean

  get subTypeName() {
    return this.subtypename === "" ? "Subtype" : this.subtypename
  }

  subtypelist:string[]
  subtype:string

  need_package:boolean;
  need_model:boolean;
  need_subtype:boolean;

  nameControl:FormControl = new FormControl("", {
    validators: [
      Validators.required,
      MixedCreatorComponent.snake_case
    ],
    asyncValidators: [
      MixedCreatorComponent.already_taken(this.cachelist)
    ],
  })

  constructor(
    public dialogRef: MatDialogRef<MixedCreatorComponent>,
    private api: EmbbedApiService,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, package?:string, model?:string, sub_type?:string, lock_type ?:boolean, lock_package?: boolean, lock_model?:boolean, lock_subtype?: boolean },
  ) {
    this.type = this.obk(this.t_dict).includes(data.type) ?
      data.type : data.type === "controller" ? "do" : "package"

      this.selected_model = data.model ? data.model : ""
      this.selected_package = data.package ? data.package : ""
      this.subtype = data.sub_type ? data.sub_type : ""

      this.lockType = data.lock_type ? data.lock_type : false
      this.lockPackage = data.lock_package && data.package ? data.lock_package : false
      this.lockModel = data.lock_model && data.model ? data.lock_model : false
      this.lockSubType = data.lock_subtype && data.sub_type ? data.lock_subtype : false

      if(this.selected_package) {
        this.onPackageSelect()
      }
  }

  async ngOnInit() {
    this.cachepkglist = await this.api.listPackages()
    this.reloadlist()
  }

  /**
   * Resync form display with the type of entity selected for creation
   */
  async reloadlist() {
    switch(this.type) {
    case "package" :
      this.cachelist = this.cachepkglist
      this.need_package = false
      this.need_model = false
      this.need_subtype = false
      this.implemented = true
      break
    case "view":
      this.need_package = true
      this.need_model = true
      this.need_subtype = true
      this.implemented = true
      this.subtypelist = ["list","form"]
      this.subtypename = "View Type"
      this.cachelist = []
      if(this.selected_package !== "" && this.selected_model !== ""){
        let x = await this.api.listViewFrom(this.selected_package,this.selected_model)
        x?.filter(item => {
          let sp = item.split(":")
          return sp[1].split(".")[0]===this.subtype && sp[0] === this.selected_package+"\\"+this.selected_model
        })
        .forEach(item => {
          return this.cachelist?.push(item.split(":")[1].split(".")[1])
        })
      }
      break
      case "class":
        this.need_package = true
        this.implemented = true
        this.need_model = false
        this.need_subtype = true
        this.subtypename = "Extends from"
        if(this.selected_package !== "") {
          let x:string[] = (await this.api.listAllModels())
          console.log(x)
          this.subtypelist = ["equal\\orm\\Model",...x]
          this.cachelist = this.cachemodellist
          console.log(this.cachelist)
        }
        break;
      case "do":
        this.need_package = true
        this.implemented = true
        this.need_model = false
        this.need_subtype = false
        if(this.selected_package) {
          this.cachelist = (await this.api.listControlerFromPackageAndByType(this.selected_package,"actions"))
        }
        break
      case "get":
        this.need_package = true
        this.implemented = true
        this.need_model = false
        this.need_subtype = false
        if(this.selected_package) {
          this.cachelist = (await this.api.listControlerFromPackageAndByType(this.selected_package,"data"))
        }
        break
      default:
        this.implemented = false
    }
    

    this.resetFormControl()
  }

  async onPackageSelect() {
    this.cachemodellist = await this.api.listModelFrom(this.selected_package)
    this.reloadlist()
  }

  resetFormControl() {
    this.nameControl.clearValidators()
    this.nameControl.addValidators(Validators.required)
    this.nameControl.addValidators(Validators.maxLength(65))
    switch(this.type){
    case "package":
      this.nameControl.addValidators(MixedCreatorComponent.snake_case)
      break;
    case "view":
      this.nameControl.addValidators(MixedCreatorComponent.snake_case)
      break;
    case "class":
      this.nameControl.addValidators(MixedCreatorComponent.camelCase)
      break;
    case "do":
    case "get":
      this.nameControl.addValidators(MixedCreatorComponent.snake_case_controller)
      break
    }
    this.nameControl.clearAsyncValidators()
    this.nameControl.addAsyncValidators(MixedCreatorComponent.already_taken(this.cachelist))
    this.nameControl.setValue(this.nameControl.value)
    if(this.NameDisabled) this.nameControl.disable()
    else this.nameControl.enable()
  }

  static camelCase(control: AbstractControl): ValidationErrors | null {
    let valid_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ\\abcdefghijkmlnopqrstuvwxyz"
    for(let char of control.value) {
      if(!valid_chars.includes(char)) return {"case":true}
    }
    let value: string[] = control.value.split("\\")
    console.log(value[value.length-1])
    let f = value[value.length-1][0]
    console.log(f)
    for(let i=0; i < value.length-1; i++) {
      if(value[i].toLowerCase() !== value[i]) return {"case":true}
    }
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(f) ? null : {"case":true}
  }

  static snake_case(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    let valid_chars = "abcdefghijkmlnopqrstuvwxyz-"
    for(let char of value) {
      if(!valid_chars.includes(char)) return {"case":true}
    }
    return null
  }

  static snake_case_controller(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    let valid_chars = "abcdefghijkmlnopqrstuvwxyz-_"
    for(let char of value) {
      if(!valid_chars.includes(char)) return {"case":true}
    }
    return null
  }



  static already_taken(pkglist: string[] | undefined): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      console.log(pkglist)
      if (pkglist === undefined) return { "taken": true }

      for (let pkg of pkglist) {
        if (pkg === control.value) return { "taken": true }
      }
      return null
    }
  }


  public getControlsErrors(controller: FormControl) {
    if (controller.getError("required")) return "this field is mandatory"
    if (controller.getError("case")) return "this does not comply with naming standards"
    if (controller.getError("taken")) return "this name is already taken"
    if (controller.getError("maxlength")) return "this name is too long"
    return ""
  }


  get createDisabled() {
    return this.NameDisabled || this.nameControl.invalid
  }

  async create() {
    switch (this.type) {
      case "package":
        await this.api.createPackage(this.nameControl.value)
        this.dialogRef.close()
        break
      case "view" :
        await this.api.createView(this.selected_package+"\\"+this.selected_model,this.subtype+"."+this.nameControl.value)
        this.dialogRef.close()
        break
      case "class" :
        await this.api.createModel(this.selected_package,this.nameControl.value,this.subtype)
        this.dialogRef.close()
        break;
      case "do" :
        await this.api.createController(this.selected_package,this.nameControl.value,"do")
        this.dialogRef.close()
        break;
      case "get" :
        await this.api.createController(this.selected_package,this.nameControl.value,"get")
        this.dialogRef.close()
        break;
      default:
        this.dialogRef.close()
    }
  }

  get NameDisabled() {
    return (this.need_package && !(this.selected_package)) || (this.need_model && !(this.selected_model)) || (this.need_subtype && !(this.subtype))
  }
}
