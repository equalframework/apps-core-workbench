import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Param } from '../../../../../_models/Params';
import { ca } from 'date-fns/locale';

@Component({
  selector: 'app-param-list',
  templateUrl: './param-list.component.html',
  styleUrls: ['./param-list.component.scss']
})
export class ParamListComponent implements OnInit, OnChanges {

  @Input() list: Params[]
  @Input() selectedIndex: number

  @Output() select = new EventEmitter<number>()
  @Output() CRUD = new EventEmitter<string>()

  public filteredList: Params[]

  public searchInput: string

  public filterControl = new FormControl("")
  public incremeter = 0

  public createControl = new FormControl("")

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
    this.filteredList = this.list.sort((p1, p2) => p1.name.localeCompare(p2.name));
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


  private _filter(value: string): Params[] {
    const filterValue = value.toLowerCase();
    return this.list.filter(option => option.name.toLowerCase().includes(filterValue)).sort((p1, p2) => p1.name.localeCompare(p2.name));
  }

  onClickItem(index: number) {
    this.select.emit(index)
  }

  createItem() {
    this.list.push(new Param(this.createControl.value ? this.createControl.value : "new_param_" + (this.incremeter++)))
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

}
