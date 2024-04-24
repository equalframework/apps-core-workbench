import { Component, Inject, OnChanges, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemTypes } from '../../_constants/ItemTypes';
import { AbstractControl, AsyncValidatorFn, FormControl, MaxLengthValidator, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { WorkbenchService } from '../../_service/package.service';

@Component({
  selector: 'app-mixed-creator',
  templateUrl: './mixed-creator.component.html',
  styleUrls: ['./mixed-creator.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class MixedCreatorComponent implements OnInit {

  // ------------------------------- ADD NEW TYPE HERE --------------------------------------------------------

  protected async casing() {
    switch(this.type) {
    case "package" :
      this.cachelist = this.cachepkglist
      this.implemented = true
      break
    case "view":
      this.need_package = true
      this.need_model = true
      this.need_subtype = true
      this.implemented = true
      this.subtypelist = ["list","form","search"]
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
      case "menu":
      this.need_package = true
      //this.need_model = true
      this.need_subtype = true
      this.implemented = true
      this.subtypelist = ["left","top"]
      this.subtypename = "View Type"
      this.cachelist = []
      if(this.selected_package !== ""){
        let x = await this.api.getMenuByPackage(this.selected_package)
        x.forEach(item => {
          return this.cachelist?.push(item.split(".")[0])
        })
      }
      break
      case "class":
        this.need_package = true
        this.implemented = true
        this.need_subtype = true
        this.subtypename = "Extends from"
        if(this.selected_package !== "") {
          let x:string[] = (await this.api.listAllModels())
          this.subtypelist = ["equal\\orm\\Model",...x]
          this.cachelist = this.cachemodellist
        }
        break;
      case "do":
        this.need_package = true
        this.implemented = true
        this.need_subtype = false
        if(this.selected_package) {
          this.cachelist = (await this.api.listControlerFromPackageAndByType(this.selected_package,"actions"))
        }
        break
      case "get":
        this.need_package = true
        this.implemented = true
        this.need_subtype = false
        if(this.selected_package) {
          this.cachelist = (await this.api.listControlerFromPackageAndByType(this.selected_package,"data"))
        }
        break
      case "route":
        this.implemented = true
        this.need_package = true
        this.need_subtype = true
        this.can_add_subtypes = true
        this.subtypename = "File"
        this.name_title = "URL"
        if(this.selected_package) {
          let x = await this.api.getRoutesByPackages(this.selected_package)
          this.subtypelist = Object.keys(x)
          this.cachelist = []
          if(x[this.subtype] && !this.addingState){
            for(let key in x[this.subtype]) {
              this.cachelist.push(key)
            }
          } else if(this.addingState) {
            this.custom_st_list = await this.api.getAllRouteFiles()
          }
        }
        break
      default:
        this.implemented = false
    }
  }

  protected namecasing() {
    switch(this.type){
      case "package":
        this.nameControl.addValidators(MixedCreatorComponent.snake_case)
        break;
      case "view":
        this.nameControl.addValidators(MixedCreatorComponent.snake_case)
        break;
      case "menu" : 
        this.nameControl.addValidators(MixedCreatorComponent.snake_case)
        break;
      case "class":
        this.nameControl.addValidators(MixedCreatorComponent.camelCase)
        break;
      case "do":
      case "get":
        this.nameControl.addValidators(MixedCreatorComponent.snake_case_controller)
        break
      case "route":
        this.nameControl.addValidators(MixedCreatorComponent.url_case_controller)
        this.customSTControl.addValidators(MixedCreatorComponent.route_file_controller)
        this.customSTControl.addValidators(MixedCreatorComponent.already_taken(this.custom_st_list))
      }
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
      case "menu" :
        await this.api.createView(this.selected_package+"\\menu",this.nameControl.value+"."+this.subtype)
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
      case "route" :
        await this.api.createroute(
          this.selected_package,
          this.addingState ? this.customSTControl.value : this.subtype,
          this.nameControl.value
        )
        this.dialogRef.close()
        break;
      default:
        this.dialogRef.close()
    }
  }

  // ---------------------------------------------------------------------------------------------------------

  public t_dict = ItemTypes.trueTypeDict
  public type: string = ""
  public obk: Function = Object.keys
  cachelist: string[] | undefined = undefined
  cachepkglist: string[] | undefined = undefined
  cachemodellist: string[] | undefined = undefined
  selected_package:string = ""
  selected_model:string = ""
  implemented:boolean = true
  protected subtypename:string = ""
  name_title = "Name"

  lockType:boolean
  lockPackage:boolean
  lockModel:boolean
  lockSubType:boolean

  get subTypeName() {
    return this.subtypename === "" ? "Subtype" : this.subtypename
  }

  

  subtypelist:string[]
  subtype:string
  custom_st_list:string[]

  need_package:boolean;
  need_model:boolean;
  need_subtype:boolean;
  can_add_subtypes:boolean;
  
  addingState:boolean = false;

  old_type:string 
  old_selected_package:string = ""
  old_selected_model:string = ""
  old_addingState:boolean = false
  old_subtype:string
  old_customST_valid:boolean


  nameControl:FormControl = new FormControl("", {
    validators: [
      Validators.required,
      MixedCreatorComponent.snake_case,
      MixedCreatorComponent.already_taken(this.cachelist)
    ],
  })

  customSTControl:FormControl = new FormControl("", {
    validators: [
      Validators.required,
    ]
  })

  constructor(
    @Optional() public dialogRef: MatDialogRef<MixedCreatorComponent>,
    private api: WorkbenchService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { type: string, package?:string, model?:string, sub_type?:string, lock_type ?:boolean, lock_package?: boolean, lock_model?:boolean, lock_subtype?: boolean },
  ) {
    console.log(data)
    if (!data){
      this.type = "package" 
      return
    }
    this.type = this.obk(this.t_dict).includes(data.type) ?
      data.type : (data.type === "controller" ? "do" : "package")

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
    if(!this.hasSomethingChanged) {
      return
    }
    this.name_title = "Name"
    this.need_package = false
    this.need_model = false
    this.need_subtype = false
    this.can_add_subtypes = false

    await this.casing()
    
    if(!this.can_add_subtypes) this.addingState = false

    this.resetFormControl()

    this.old_type = this.type
    this.old_addingState = this.addingState
    this.old_selected_model = this.selected_model
    this.old_subtype = this.subtype
    this.old_selected_package = this.selected_package
    this.old_customST_valid = this.customSTControl.valid
  }

  get hasSomethingChanged():boolean {
    return this.old_type !== this.type ||
      this.old_addingState !== this.addingState ||
      this.old_selected_model !== this.selected_model ||
      this.old_subtype !== this.subtype ||
      this.old_selected_package !== this.selected_package ||
      this.old_customST_valid !== this.customSTControl.valid
  }

  async onPackageSelect() {
    this.cachemodellist = [...(await this.api.listModelFrom(this.selected_package)),...(await this.api.listControlerFromPackageAndByType(this.selected_package,"data"))]
    this.reloadlist()
  }

  resetFormControl() {
    this.nameControl.clearValidators()
    this.nameControl.addValidators(Validators.required)
    this.nameControl.addValidators(Validators.maxLength(65))
    this.nameControl.addValidators(MixedCreatorComponent.already_taken(this.cachelist))
    this.customSTControl.clearValidators()
    this.customSTControl.addValidators(Validators.required)

    this.namecasing()

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
    let f = value[value.length-1][0]
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

  static url_case_controller(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    if(value.length < 2) return {"case":true}
    if(!value.startsWith('/')) return {"case":true}
    let valid_chars = "abcdefghijkmlnopqrstuvwxyz_/:"
    for(let char of value) {
      if(!valid_chars.includes(char)) return {"case":true}
    }
    return null
  }

  static route_file_controller(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value
    let dgts:string = "0123456789"
    let letter:string = "abcdefghijklmnopqrstuvwxyz"
    if(value.length < 3) return {"case":true}
    if(!value.endsWith(".json")) return {"case":true}
    if(!(dgts.includes(value[0]) && dgts.includes(value[1])) || (value[0] === "0" && value[1] === "0")) return {"case":true}
    if(value[2] !== "-") return {"case":true}
    for(let i=3 ; i < value.length-5 ; i++){
      if(!letter.includes(value[i])) return {"case":true}
    }
    return null
  }

  static already_taken(pkglist: string[] | undefined): ValidatorFn {
    return (control: AbstractControl):ValidationErrors | null => {
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

  get NameDisabled() {
    return (this.need_package && !(this.selected_package)) || (this.need_model && !(this.selected_model)) || (
      ( (!this.can_add_subtypes || !this.addingState) && this.need_subtype && !(this.subtype)) || (this.can_add_subtypes && this.addingState && this.customSTControl.invalid)
    )
  }

  setAddingState(state:boolean){
    this.addingState = state
    this.reloadlist()
  }
}
