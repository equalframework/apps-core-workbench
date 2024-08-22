import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Field } from '../../_object/Field';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-field-editor-list',
  templateUrl: './field-editor-list.component.html',
  styleUrls: ['./field-editor-list.component.scss']
})
export class FieldEditorListComponent implements OnInit {
  @Input() list: Field[]
  @Input() parentList: Field[]
  @Input() selectedIndex: number

  @Output() select = new EventEmitter<number>();
  @Output() CRUD = new EventEmitter<string>();

  public filteredList: Field[];

  public searchInput: string;

  public filterControl = new FormControl("");
  public incremeter = 0;

  public createControl = new FormControl("");

  public iconList: { [id: string]: string } = {
    "string": "format_quote",
    "integer": "123",
    "array": "data_array",
    "float": "money",
    "boolean": "question_mark",
    "computed": "functions",
    "alias": "type_specimen",
    "binary": "looks_one",
    "date": "today",
    "datetime": "event",
    "time": "access_time",
    "text": "article",
    "many2one": "call_merge",
    "one2many": "call_split",
    "many2many": "height"
  }

  constructor() {

  }

  ngOnInit(): void {
    console.log("=============")
    this.filteredList = this._filter("")
    console.log(this.filteredList)
    this.filterControl.valueChanges.subscribe(data => {
      console.log("RTIO")
      this.filteredList = this._filter(data)
    })
  }

  ngOnChanges(): void {
    console.log("----")
    console.log(this.list)
    this.filteredList = this._filter(this.filterControl.value)
  }


  private _filter(value: string): Field[] {
    const filterValue = value.toLowerCase();
    return this.list.filter(option => option.name.toLowerCase().includes(filterValue)).sort((p1, p2) => {
      let p1Inherited = this.isInherited(p1)
      let p2Inherited = this.isInherited(p2)
      let p1Overrided = this.isOverrided(p1)
      let p2Overrided = this.isOverrided(p2)
      if(p1.isUneditable !== p2.isUneditable) return p1.isUneditable ? 1 : -1
      if(p1Inherited !== p2Inherited) return p1Inherited ? 1 : -1
      if(p1Overrided !== p2Overrided) return p1Overrided ? -1 : 1
      return p1.name.localeCompare(p2.name)
    });
  }

  onClickItem(index: number) {
    this.select.emit(index)
  }

  createItem() {
    for(let item of this.list) {
      if(this.createControl.value === item.name) return
    }
    this.list.push(new Field({},this.createControl.value ? this.createControl.value : "new_param_" + (this.incremeter++)))
    this.CRUD.emit("Creation of a new param")
    this.createControl.setValue("")
    this.filteredList = this._filter(this.filterControl.value)
  }

  deleteItem(index: number) {
    let d = this.list.splice(index, 1)
    this.CRUD.emit("deletion of " + d[0].name)
    this.onClickItem(-1)
    this.filteredList = this._filter(this.filterControl.value)
  }

  resetFieldToParent(index :number) {
    this.list[index] = this.cloneParent(this.list[index].name)
    this.CRUD.emit("Reset of "+this.list[index].name+" to its inherited state")
  }

  cloneParent(name:string):Field {
    for(let item of this.parentList) {
      if(name === item.name) return cloneDeep(item)
    }
    return new Field()
  }

  isInherited(field:Field):boolean {
    if(field.isUneditable) return true
    for(let item of this.parentList) {
      if(field.name === item.name) return true
    }
    return false
  }

  isOverrided(field:Field):boolean {
    if(field.isUneditable) return false
    for(let item of this.parentList) {
      if(field.name === item.name) {
        return !field.areSimilar(item)
      }
    }
    return false
  }
}
