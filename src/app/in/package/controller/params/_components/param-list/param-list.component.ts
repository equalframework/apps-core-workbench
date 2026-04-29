import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Params } from '@angular/router';
import { Param } from '../../../../../_models/Params';

@Component({
  selector: 'app-param-list',
  templateUrl: './param-list.component.html',
  styleUrls: ['./param-list.component.scss']
})
export class ParamListComponent implements OnInit, OnChanges {

  @Input() list: Params[] = [];
  @Input() selectedIndex: number = -1;

  @Output() itemSelected = new EventEmitter<number>();
  @Output() CRUD = new EventEmitter<string>();

  public filteredList: Params[];

  public searchInput: string;

  public filterControl = new FormControl('');
  public incrementor = 0;

  public createControl = new FormControl('');

  public iconList: { [id: string]: string } = {
    string: 'format_quote',
    integer: '123',
    array: 'data_array',
    float: 'money',
    boolean: 'question_mark',
    computed: 'functions',
    alias: 'type_specimen',
    binary: 'looks_one',
    date: 'today',
    datetime: 'event',
    time: 'access_time',
    text: 'article',
    many2one: 'call_merge',
    one2many: 'call_split',
    many2many: 'height'
  };

  constructor() {

  }

  ngOnInit(): void {
    this.filteredList = [...this.list].sort((p1, p2) => p1.name.localeCompare(p2.name));
    this.filterControl.valueChanges.subscribe(data => {
      this.filteredList = this._filter(data);
    });
  }

  ngOnChanges(): void {
    this.filteredList = this._filter(this.filterControl.value);
  }


  private _filter(value: string): Params[] {
    const filterValue = (value || '').toLowerCase();
    return this.list.filter(option => option.name.toLowerCase().includes(filterValue)).sort((p1, p2) => p1.name.localeCompare(p2.name));
  }

  public onClickItem(index: number): void {
    this.itemSelected.emit(index);
  }

  public createItem(): void {
    const newName = this.createControl.value ? this.createControl.value : 'new_param_' + (this.incrementor++);
    if (this.list.some(param => param.name === newName)) {
      return;
    }
    this.list.push(new Param(newName));
    this.CRUD.emit('Creation of a new param');
    this.createControl.setValue('');
    this.filteredList = this._filter(this.filterControl.value);
  }

  public deleteItem(index: number): void {
    if (index < 0 || index >= this.list.length) {
      return;
    }
    const d = this.list.splice(index, 1);
    this.CRUD.emit('deletion of ' + d[0].name);
    this.onClickItem(-1);
    this.filteredList = this._filter(this.filterControl.value);
  }

  public clearFilter(): void {
    this.filterControl.setValue('');
  }

  public trackByFn(index: number, item: Params): number {
    return index;
  }

}
