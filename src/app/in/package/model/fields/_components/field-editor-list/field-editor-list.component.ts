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
  @Input() list: Field[];
  @Input() parentList: Field[];
  @Input() selectedIndex = -1;

  @Output() select = new EventEmitter<number>();
  @Output() CRUD = new EventEmitter<string>();

  public filteredList: Field[];

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
    this.filteredList = this._filter('');
    this.filterControl.valueChanges.subscribe(data => {
      this.filteredList = this._filter(data);
    });
  }

  ngOnChanges(): void {
    this.filteredList = this._filter(this.filterControl.value);
  }

  trackByFieldName(index: number, item: Field): string {
    return item.name;
  }


  private _filter(value: string): Field[] {
    const filterValue = (value || '').toLowerCase();
    return this.list.filter(option => option.name.toLowerCase().includes(filterValue)).sort((p1, p2) => {
      const p1Inherited = this.isInherited(p1);
      const p2Inherited = this.isInherited(p2);
      const p1Overridden = this.isOverridden(p1);
      const p2Overridden = this.isOverridden(p2);
      if (p1.isUneditable !== p2.isUneditable) { return p1.isUneditable ? 1 : -1; }
      if (p1Inherited !== p2Inherited) { return p1Inherited ? 1 : -1; }
      if (p1Overridden !== p2Overridden) { return p1Overridden ? -1 : 1; }
      return p1.name.localeCompare(p2.name);
    });
  }

  onClickItem(index: number): void {
    this.select.emit(index);
  }

  createItem(): void {
    for (const item of this.list) {
      if (this.createControl.value === item.name) { return; }
    }
    this.list.push(new Field({}, this.createControl.value ? this.createControl.value : 'new_param_' + (this.incrementor++)));
    this.CRUD.emit('Creation of a new param');
    this.createControl.setValue('');
    this.filteredList = this._filter(this.filterControl.value);
  }

  deleteItem(index: number): void {
    const d = this.list.splice(index, 1);
    this.CRUD.emit('deletion of ' + d[0].name);
    this.onClickItem(-1);
    this.filteredList = this._filter(this.filterControl.value);
  }

  resetFieldToParent(index: number): void {
    this.list[index] = this.cloneParent(this.list[index].name);
    this.CRUD.emit('Reset of ' + this.list[index].name + ' to its inherited state');
  }

  cloneParent(name: string): Field {
    for (const item of this.parentList) {
      if (name === item.name) { return cloneDeep(item); }
    }
    return new Field();
  }

  isInherited(field: Field): boolean {
    if (field.isUneditable) { return true; }
    for (const item of this.parentList) {
      if (field.name === item.name) { return true; }
    }
    return false;
  }

  isOverridden(field: Field): boolean {
    if (field.isUneditable) { return false; }
    for (const item of this.parentList) {
      if (field.name === item.name) {
        return !field.areSimilar(item);
      }
    }
    return false;
  }
}
