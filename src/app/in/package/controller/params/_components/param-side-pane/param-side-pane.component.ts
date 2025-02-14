import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Param, Usage } from '../../../../../_models/Params';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { filter, values } from 'lodash';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
  selector: 'app-param-side-pane',
  templateUrl: './param-side-pane.component.html',
  styleUrls: ['./param-side-pane.component.scss']
})
export class ParamSidePaneComponent implements OnInit, OnChanges {

  @Input() param: Param | null | undefined;
  @Input() types: string[];
  @Input() usages: string[];
  @Input() scheme:{[id:string]:any};
  @Input() modelList:string[] = [];

  filteredModelList:string[];

  alert = alert;


  @Output() CRUD = new EventEmitter<string>();

  protected nameEdit: boolean = false;

  foreignControl = new FormControl("", {
    validators : []
  })

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
    this.filteredModelList = this.modelList
    this.foreignControl.valueChanges.subscribe( (value:string) => {
      //console.log('VALUE : '+value)
      if(!value) {
        this.filteredModelList = this.modelList
        return
      }
      this.changeForeign()
      this.filteredModelList = this.modelList.filter( (item:string) => item.toLowerCase().includes(value.toLowerCase())).sort((p1:string,p2:string) => p1.localeCompare(p2))
    })
  }

  ngOnChanges() {
    this.foreignControl.clearValidators()
    this.foreignControl.addValidators((control: AbstractControl) => {
        if (this.modelList && Array.isArray(this.modelList) && this.modelList.includes(control.value)) {
          return null;
        } else {
          return { "case": true };
        }
      });    this.foreignControl.setValue(this.param?.foreign_object,{emitEvent : false})
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

  changeTypeValue(value: string) {
    console.log(value)
    if (this.param) {
      this.param.type = value
      this.param.default = undefined
      this.param.selection = []
      if(value !== 'many2many' && value !== 'one2many' && value !== 'many2one') {
        this.param._has_domain = false
      }
      this.CRUD.emit("changed type of "+this.param.name+" to "+this.param.type)
    }
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

  public change_has_selection(checked:boolean) {
    if(this.param) {
      this.param._has_selection = checked
      this.CRUD.emit("Toggled selection of "+this.param.name)
    }

  }

  public change_has_domain(checked:boolean) {
    if(this.param) {
      this.param._has_domain = checked
      this.CRUD.emit("Toggled domain of "+this.param.name)
    }

  }

  public changeVisible_Domain(domain:any) {
    if(this.param) {
      console.log("DOMAIN CHANGED")
      console.log(domain)
      this.param.visible_domain = domain
      this.CRUD.emit("Changed domain of "+this.param.name)
    }
  }

  changeForeign() {
    if(this.foreignControl.invalid) return
    if(this.param) {
      if(this.param.foreign_object === this.foreignControl.value) return
      this.param.foreign_object = this.foreignControl.value
      this.param.domain = []
      this.CRUD.emit('changed foreign object of '+this.param.name+' to '+this.foreignControl.value)
    }
  }


  public changeDefault(value:any) {
    if(this.param) {
      this.param.default = value
      this.CRUD.emit("Changed default value of "+this.param.name)
    }
  }

  change_visibility_is_domain(value:boolean) {
    if(this.param) {
      this.param._visibility_is_domain = value
      this.CRUD.emit("Changed visibility type of "+this.param.name)
    }
  }

  changeVisible_bool(value:boolean) {
    if(this.param) {
      this.param.visible_bool = value
      this.CRUD.emit("Changed visibility of "+this.param.name+" to "+value)
    }
  }

  public addToSelection() {
    if(this.param) {
      this.param.selection.push(undefined)
    }
  }

  public deleteSelection(index:number) {
    this.param?.selection.splice(index,1)
  }

  noCancel(event: KeyboardEvent) {
    console.log(event)
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

}

function snake_case(control: AbstractControl): ValidationErrors | null {
    let value: string = control.value;
    
    if (!value) {
      return { "case": true }; // ou return null pour autoriser les valeurs vides
    }
  
    let valid_chars = "abcdefghijklmnopqrstuvwxyz_";
    for (let char of value) {
      if (!valid_chars.includes(char)) return { "case": true };
    }
    return null;
  }
  
