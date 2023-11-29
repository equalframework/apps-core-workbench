import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { Field } from '../../_object/Field';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-field-editor-sp',
  templateUrl: './field-editor-sp.component.html',
  styleUrls: ['./field-editor-sp.component.scss']
})
export class FieldEditorSpComponent implements OnInit {

  obk = Object.keys

  @Input() inherited:boolean = false
  @Input() field: Field | null | undefined
  @Input() types:string[]
  @Input() models:string[]
  @Input() fields:string[] = []
  @Input() computeds:string[] = []
  @Input() dummyscheme:any = {}

  @Output() CRUD = new EventEmitter<string>()
  @Output() navToParent = new EventEmitter<void>()

  nameEdit:boolean = false

  dependencyInput:string = ""

  ffields:string[] = []
  oldfobj:string = ""


  typeDirective:{[id:string]:any}
  finalTypeDirective:{[id:string]:any}

  nameControl = new FormControl("", {
    validators: [snake_case, Validators.required, Validators.max(32)]
  })

  constructor(
    private api:EmbbedApiService
  ) { }

  ngOnInit(): void {
    console.log(Field.type_directives)
  }

  async ngOnChanges() {
    console.log("refreshed")
    if(this.field)
      try {
        if(this.oldfobj !== this.field.foreign_object) {
          this.oldfobj = this.field.foreign_object
          this.ffields = Object.keys((await this.api.getSchema(this.field.foreign_object))["fields"])
        }
        this.typeDirective = Field.type_directives[this.field.type]
        this.finalTypeDirective = Field.type_directives[this.field.finalType]
      }
      catch {
      }
  }

  public setNameBeingEdited(value: boolean) {
    this.nameEdit = value
    if (value) {
      this.nameControl.setValue(this.field?.name)
    } else {
      this.nameControl.markAsUntouched()
    }
  }

  get nameBeingEdited() {
    return this.nameEdit
  }

  public changeName() {
    if (this.field && this.nameControl.valid) {
      let oldname = this.field.name
      this.field.name = this.nameControl.value
      this.CRUD.emit("Renaming "+oldname+" to "+this.field.name)
      this.setNameBeingEdited(false)
      this.nameControl.markAsUntouched()
    }
  }

  changeTypeValue(value: string) {
    console.log(value)
    if (this.field) {
      this.field.type = value
      this.field.default = undefined
      this.field.selection = []
      this.CRUD.emit("changed type of "+this.field.name+" to "+this.field.type)
    }
  }

  changeResultType(value: string) {
    if (this.field) {
      this.field.result_type = value
      this.field.default = undefined
      this.field.selection = []
      this.CRUD.emit("changed result_type of "+this.field.name+" to "+this.field.result_type)
    }
  }

  changeFunction(value:string) {
    if (this.field) {
      this.field.function = value
      this.CRUD.emit("changed function of "+this.field.name+" to "+this.field.function)
    }
  }

  changeDesc(value:string) {
    if (this.field) {
      this.field.description = value
      this.CRUD.emit("changed description of "+this.field.name)
    }
  }

  changeForeignObject(value :string) {
    if(this.field){
      this.field.foreign_object = value
      this.field.foreign_field = ""
      this.CRUD.emit("Changed foreign_object of "+this.field.name)
    }
  }

  changeForeignField(value :string) {
    if(this.field){
      this.field.foreign_field = value
      this.CRUD.emit("Changed foreign_field of "+this.field.name)
    }
  }

  changeReadonly(value :boolean) {
    if(this.field){
      this.field.readonly = value
      this.CRUD.emit("Toggeled readonly of "+this.field.name)
    }
  }

  changeUnique(value :boolean) {
    if(this.field){
      this.field.unique = value
      this.CRUD.emit("Toggeled unique of "+this.field.name)
    }
  }

  changeStore(value :boolean) {
    if(this.field){
      this.field.store = value
      this.CRUD.emit("Toggeled store of "+this.field.name)
    }
  }

  changeInstant(value :boolean) {
    if(this.field){
      this.field.instant = value
      this.CRUD.emit("Toggeled instant of "+this.field.name)
    }
  }

  changeRequired(value :boolean) {
    if(this.field){
      this.field.required = value
      this.CRUD.emit("Toggeled required of "+this.field.name)
    }
  }

  changeMultilang(value :boolean) {
    if(this.field){
      this.field.multilang = value
      this.CRUD.emit("Toggeled multilang of "+this.field.name)
    }
  }

  changeHasDefault(value :boolean) {
    if(this.field){
      this.field._has_default = value
      this.CRUD.emit("Toggeled default of "+this.field.name)
    }
  }

  changeHasSelection(value :boolean) {
    if(this.field){
      this.field._has_selection = value
      this.CRUD.emit("Toggeled selection of "+this.field.name)
    }
  }

  changeDefault(value:any) {
    if(this.field){
      this.field.default = value
      this.CRUD.emit("changed default of "+this.field.name)
    }
  }

  changeRelTable(value :string) {
    if(this.field){
      this.field.rel_table = value
      this.CRUD.emit("changed rel_table of "+this.field.name)
    }
  }

  changeRelLocalKey(value :string) {
    if(this.field){
      this.field.rel_local_key = value
      this.CRUD.emit("changed rel_local_key of "+this.field.name)
    }
  }

  changeRelForeignKey(value :string) {
    if(this.field){
      this.field.rel_foreign_key = value
      this.CRUD.emit("changed rel_foreign_key of "+this.field.name)
    }
  }

  public changeAlias(value : string) {
    if(this.field){
      this.field.alias = value
      this.CRUD.emit("changed alias of "+this.field.name)
    }
  }
 
  public addToSelection() {
    if(this.field) {
      this.field.selection.push(undefined)
    }
  }

  public deleteSelection(index:number) {
    this.field?.selection.splice(index,1)
  }

  changeHasDependencies(value :boolean) {
    if(this.field){
      this.field._has_dependencies = value
      this.CRUD.emit("Toggeled dependencies of "+this.field.name)
    }
  }

  changeHasVisible(value :boolean) {
    if(this.field){
      this.field._has_visible = value
      this.CRUD.emit("Toggeled visible of "+this.field.name)
    }
  }

  changeHasDomain(value :boolean) {
    if(this.field){
      this.field._has_domain = value
      this.CRUD.emit("Toggeled domain of "+this.field.name)
    }
  }

  changeOnUpdate(value:string) {
    if (this.field) {
      this.field.onupdate = value
      this.CRUD.emit("changed onupdate of "+this.field.name)
    }
  }

  changeOnRevert(value:string) {
    if (this.field) {
      this.field.onrevert = value
      this.CRUD.emit("changed onrevert of "+this.field.name)
    }
  }

  changeOnDelete(value:string) {
    if (this.field) {
      this.field.ondelete = value
      this.CRUD.emit("changed ondelete of "+this.field.name)
    }
  }

  changeOnDetach(value:string) {
    if (this.field) {
      this.field.ondetach = value
      this.CRUD.emit("changed ondetach of "+this.field.name)
    }
  }

  changeVisible(value:any) {
    if (this.field) {
      this.field.visible = value
      this.CRUD.emit("changed visiblilty of "+this.field.name)
    }
  }

  changeDomain(value:any) {
    if (this.field) {
      this.field.domain = value
      this.CRUD.emit("changed domain of "+this.field.name)
    }
  }

  public addToDependencies() {
    if(this.field && !this.field.dependencies.includes(this.dependencyInput)) {
      this.field.dependencies.push(this.dependencyInput)
      this.dependencyInput = ""
      this.CRUD.emit("added dependecy to "+this.field.name)
    }
  }

  public DeleteDependency(index:number) {
    this.field?.dependencies.splice(index,1)
    this.CRUD.emit("deleted dependecy to "+this.field?.name)
  }

  public changeSelection(index:number,value:any) {
    if(this.field){
      this.field.selection[index] = value
      this.CRUD.emit("changed value of selection")
    }
  }

  noCancel(event: KeyboardEvent) {
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  } 

  navigateToParent() {
    this.navToParent.emit()
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