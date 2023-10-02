import { Component, Inject, OnChanges, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemTypes } from '../../_constants/ItemTypes';
import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
    @Inject(MAT_DIALOG_DATA) public data: { type: string },
  ) {
    this.type = this.obk(this.t_dict).includes(data.type) ?
      data.type : data.type === "controller" ? "do" : "package"
      
  }

  async ngOnInit() {
    this.cachepkglist = await this.api.listPackages()
    this.reloadlist()
  }

  async reloadlist() {
    switch(this.type) {
    case "package" :
      this.cachelist = this.cachepkglist
      this.need_package = false
      this.need_model = false
      this.need_subtype = false
      break
    case "view":
      this.need_package = true
      this.need_model = true
      this.need_subtype = true
      this.subtypelist = ["list","form"]
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
    }
    

    this.resetFormControl()
  }

  async onPackageSelect() {
    this.cachemodellist = await this.api.listModelFrom(this.selected_package)
    this.reloadlist()
  }

  resetFormControl() {
    this.nameControl.clearAsyncValidators()
    this.nameControl.addAsyncValidators(MixedCreatorComponent.already_taken(this.cachelist))
    this.nameControl.setValue(this.nameControl.value)
  }

  static snake_case(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value

    return value.toLowerCase() === value ? null : { "case": true }
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
    return ""
  }


  get createDisabled() {
    if(this.nameControl.invalid) return true
    if(this.need_package && this.selected_package === "") return true
    if(this.need_model && this.selected_model === "") return true
    if(this.need_subtype && this.subtype === "") return true 
    return false
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
      default:
        this.dialogRef.close()
    }
  }

}
