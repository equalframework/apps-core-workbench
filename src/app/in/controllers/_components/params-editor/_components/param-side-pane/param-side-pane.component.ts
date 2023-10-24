import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Param, Usage } from '../../_objects/Params';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { filter } from 'lodash';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
  selector: 'app-param-side-pane',
  templateUrl: './param-side-pane.component.html',
  styleUrls: ['./param-side-pane.component.scss']
})
export class ParamSidePaneComponent implements OnInit {

  @Input() param: Param | null | undefined
  @Input() types: string[]
  @Input() usages: string[]

  alert = alert

  @Output() CRUD = new EventEmitter<string>()

  protected nameEdit: boolean = false;

  nameControl = new FormControl("", {
    validators: [snake_case, Validators.required, Validators.max(32)]
  })

  tmp_usage: string = ""

  constructor(
    private typeUsage: TypeUsageService
  ) { }

  ngOnInit(): void {
    let x = new Usage("aaaaa/b.c:d.k{e,f}")
    console.log(x)
  }

  public setNameBeingEdited(value: boolean) {
    this.nameEdit = value
    if (value) {
      this.nameControl.setValue(this.param?.name)
    } else {
      this.nameControl.markAsUntouched()
    }
  }

  get nameBeingEdited() {
    return this.nameEdit
  }

  public changeName() {
    if (this.param && this.nameControl.valid) {
      let oldname = this.param.name
      this.param.name = this.nameControl.value
      this.CRUD.emit("Renaming "+oldname+" to "+this.param.name)
      this.setNameBeingEdited(false)
      this.nameControl.markAsUntouched()
    }
  }

  public changeUsage(value: string) {
    console.log("USAGE CHANGED")
    if (this.param) {
      this.param.usage.setUsage(this.usageForCurrentType?.includes(value) ? value : "")
      this.CRUD.emit(this.param.usage.usage ? "Changed usage of "+this.param.name+" to "+this.param.usage.usage : "removed usage of "+this.param.name)
    }
  }

  public changeSubUsage(value: string) {
    console.log("SUBUSAGE CHANGED")
    if (this.param) {
      this.param.usage.setSubUsage(this.possibleSubUsage?.includes(value) ? value : "")
      this.CRUD.emit(this.param.usage.subusage ? "Changed subusage of "+this.param.name+" to "+this.param.usage.subusage : "removed subusage of "+this.param.name)
    }
  }

  public changeVariation(value: string) {
    console.log("VARIATION CHANGED")
    if (this.param) {
      this.param.usage.setVariation(this.possibleVariations?.includes(value) ? value : "")
      this.CRUD.emit(this.param.usage.variation ? "Changed variation of "+this.param.name+" to "+this.param.usage.variation : "removed variation of "+this.param.name)
    }
  }

  public changeLength(value: string) {
    console.log("LENGTH CHANGED")
    if (this.param) {
      if(this.hasFreeLength) {
        console.log(this.lengthDim)
        console.log(value.split(".",this.lengthDim).join("."))
        this.param.usage.setLength(value.split(".",this.lengthDim).join("."))
      } else {
        this.param.usage.setLength(this.possibleLength?.includes(value) ? value : "")
      }
      this.CRUD.emit(this.param.usage.length ? "Changed length of "+this.param.name+" to "+this.param.usage.length : "removed length of "+this.param.name)
    }
  }

  public changeMin(value: string) {
    console.log("MIN CHANGED")
    if (this.param) {
        this.param.usage.setMin(value)
        this.CRUD.emit(this.param.usage.min ? "Changed min value of "+this.param.name+" to "+this.param.usage.min : "Removed min value of "+this.param.name)
    }
  }


  public changeMax(value: string) {
    console.log("Max CHANGED")
    if (this.param) {
        this.param.usage.setMax(value)
        this.CRUD.emit(this.param.usage.max ? "Changed max value of "+this.param.name+" to "+this.param.usage.max : "Removed max value of "+this.param.name)
    }
  }


  changeTypeValue(value: string) {
    console.log(value)
    if (this.param) {
      this.param.type = value
      this.CRUD.emit("changed type of "+this.param.name+" to "+this.param.type)
    }
  }

  get usageForCurrentType(): string[] | undefined {
    if (this.param && this.typeUsage.usages[this.param.type]) {
      return ["", ...(Object.keys(this.typeUsage.usages[this.param.type]).filter(item => item !== "length_free" && item !== "length_dim" && item !== "boundary"))]
    }
    return undefined
  }

  get possibleSubUsage(): string[] | undefined {
    if (this.param && this.param.usage.usage && this.typeUsage.usages[this.param.type] && this.typeUsage.usages[this.param.type][this.param.usage.usage] && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages) {
      return ["", ...Object.keys(this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages)]
    }
    return undefined
  }

  get possibleVariations(): string[] | undefined {
    if (this.param
      && this.param.usage.usage
      && this.typeUsage.usages[this.param.type]
      && this.typeUsage.usages[this.param.type][this.param.usage.usage]
      && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages
      && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage]
      && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations
    ) {
      return ["", ...Object.keys(this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations)]
    }
    return undefined
  }

  get possibleLength(): string[] | undefined {
    if (this.param) {
      if (
        this.param.usage.usage
        && this.typeUsage.usages[this.param.type]
        && this.typeUsage.usages[this.param.type][this.param.usage.usage]
      ) {
        if (!this.param.usage.subusage && this.typeUsage.usages[this.param.type][this.param.usage.usage].length) {
          return ["", ...this.typeUsage.usages[this.param.type][this.param.usage.usage].length]
        }
        if (
          this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages
          && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage]
        ) {
          if (!this.param.usage.variation && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length) {
            return ["", ...this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length]
          }
          if (
            this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations
            && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation]
            && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation].length
          ) {
            return ["", ...Object.keys(this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation].length)]
          }
        }
      }
    }
    return undefined
  }

  get hasFreeLength(): boolean {
    let res = false
    if (this.param) {
      if(
        this.typeUsage.usages[this.param.type]
      ){
        if (this.typeUsage.usages[this.param.type].length_free !== undefined) {
          res = this.typeUsage.usages[this.param.type].length_free
        }

        if (
          this.typeUsage.usages[this.param.type][this.param.usage.usage]
        ) {
          if (this.typeUsage.usages[this.param.type][this.param.usage.usage].length_free !== undefined) {
            res = this.typeUsage.usages[this.param.type][this.param.usage.usage].length_free
          }

          if (
            this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages
            && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage]
          ) {
            if (this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_free !== undefined) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_free
            }

            if (
              this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation]
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation].length_free !== undefined
            ) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_free
            }
          }
        }
      }
    }
    return res
  }

  get lengthDim(): number {
    let res = 1
    if (this.param) {
      if(
        this.typeUsage.usages[this.param.type]
      ){
        if (this.typeUsage.usages[this.param.type].length_dim !== undefined) {
          res = this.typeUsage.usages[this.param.type].length_dim
        }

        if (
          this.typeUsage.usages[this.param.type][this.param.usage.usage]
        ) {
          if (this.typeUsage.usages[this.param.type][this.param.usage.usage].length_dim !== undefined) {
            res = this.typeUsage.usages[this.param.type][this.param.usage.usage].length_dim
          }

          if (
            this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages
            && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage]
          ) {
            if (this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_dim !== undefined) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_dim
            }

            if (
              this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation]
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation].length_dim !== undefined
            ) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].length_dim
            }
          }
        }
      }
    }
    return res
  }

  get canHaveBoundaries(): boolean {
    let res = false
    if (this.param) {
      if(
        this.typeUsage.usages[this.param.type]
      ){
        if (this.typeUsage.usages[this.param.type].boundary !== undefined) {
          res = this.typeUsage.usages[this.param.type].boundary
        }

        if (
          this.typeUsage.usages[this.param.type][this.param.usage.usage]
        ) {
          if (this.typeUsage.usages[this.param.type][this.param.usage.usage].boundary !== undefined) {
            res = this.typeUsage.usages[this.param.type][this.param.usage.usage].boundary
          }

          if (
            this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages
            && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage]
          ) {
            if (this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].boundary !== undefined) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].boundary
            }

            if (
              this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation]
              && this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].variations[this.param.usage.variation].boundary !== undefined
            ) {
              res = this.typeUsage.usages[this.param.type][this.param.usage.usage].subusages[this.param.usage.subusage].boundary
            }
          }
        }
      }
    }
    return res
  }

  public changeRequired(checked:boolean) {
    if(this.param) {
      this.param.required = checked
      this.CRUD.emit("Set required to "+checked+" for param "+this.param.name)
    }
    
  }

  public changeDesc(value :string) {
    if(this.param) {
      this.param.description = value
      this.CRUD.emit("Changed description of "+this.param.name)
    }
  }

  public change_has_default(checked:boolean) {
    if(this.param) {
      this.param._has_default = checked
      this.CRUD.emit("Toggled default of "+this.param.name)
    }
    
  }

  public change_visibility(checked:boolean) {
    if(this.param) {
      this.param._visibility = checked
      this.CRUD.emit("Toggled visibility of "+this.param.name)
    }
    
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

}


function snake_case(control: AbstractControl): ValidationErrors | null {
  let value: string = control.value
  let valid_chars = "abcdefghijkmlnopqrstuvwxyz_"
  for (let char of value) {
    if (!valid_chars.includes(char)) return { "case": true }
  }
  return null
}