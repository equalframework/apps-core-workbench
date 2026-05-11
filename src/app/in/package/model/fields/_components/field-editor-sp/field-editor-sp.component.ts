import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Field } from '../../_object/Field';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
  selector: 'app-field-editor-sp',
  templateUrl: './field-editor-sp.component.html',
  styleUrls: ['./field-editor-sp.component.scss']
})
export class FieldEditorSpComponent implements OnInit {

  obk = Object.keys;

  @Input() inherited = false;
  @Input() field: Field | null | undefined;
  @Input() types: string[];
  @Input() models: string[];
  @Input() entity = '';
  @Input() fields: string[] = [];
  @Input() computedFields: string[] = [];
  @Input() dummyScheme: any = {};
  @Input() selectedTabIndex = 0;

  @Output() CRUD = new EventEmitter<string>();
  @Output() navToParent = new EventEmitter<void>();
  @Output() selectedTabIndexChange = new EventEmitter<number>();

  dependencyInput = '';

  _fields: string[] = [];
  oldFObj = '';


  typeDirective: {[id: string]: any} = {};
  finalTypeDirective: {[id: string]: any} = {};

  constructor(
    private workbenchService: WorkbenchService
  ) { }

  ngOnInit(): void {
  }

  async ngOnChanges(): Promise<void> {
    if (this.field) {
      try {
        if (this.oldFObj !== this.field.foreign_object) {
          this.oldFObj = this.field.foreign_object;
          this._fields = Object.keys((await this.workbenchService.getSchema(this.field.foreign_object).toPromise()).fields);
        }
        this.typeDirective = Field.type_directives[this.field.type];
        this.finalTypeDirective = Field.type_directives[this.field.finalType];
      }
      catch {
      }
    }
  }

  public changeName(value: string): void {
    if (this.field && value && value.toLowerCase() === value && value.match(/^[a-z_][a-z0-9_]*$/)) {
      const oldname = this.field.name;
      this.field.name = value;
      this.CRUD.emit('Renaming ' + oldname + ' to ' + this.field.name);
    }
  }

  changeTypeValue(value: string): void {
    if (this.field) {
      this.field.type = value;
      this.field.default = undefined;
      this.field.selection = [];
      this.CRUD.emit('changed type of ' + this.field.name + ' to ' + this.field.type);
    }
  }

  changeResultType(value: string): void {
    if (this.field) {
      this.field.resultType = value;
      this.field.default = undefined;
      this.field.selection = [];
      this.CRUD.emit('changed result_type of ' + this.field.name + ' to ' + this.field.resultType);
    }
  }

  changeFunction(value: string): void {
    if (this.field) {
      this.field.function = value;
      this.CRUD.emit('changed function of ' + this.field.name + ' to ' + this.field.function);
    }
  }

  changeDesc(value: string): void {
    if (this.field) {
      this.field.description = value;
      this.CRUD.emit('changed description of ' + this.field.name);
    }
  }

  changeForeignObject(value: string): void {
    if (this.field){
      this.field.foreign_object = value;
      this.field.foreign_field = '';
      this.CRUD.emit('Changed foreign_object of ' + this.field.name);
    }
  }

  changeForeignField(value: string): void {
    if (this.field){
      this.field.foreign_field = value;
      this.CRUD.emit('Changed foreign_field of ' + this.field.name);
    }
  }

  changeReadonly(value: boolean): void {
    if (this.field){
      this.field.readonly = value;
      this.CRUD.emit('Toggled readonly of ' + this.field.name);
    }
  }

  changeUnique(value: boolean): void {
    if (this.field){
      this.field.unique = value;
      this.CRUD.emit('Toggled unique of ' + this.field.name);
    }
  }

  changeStore(value: boolean): void {
    if (this.field){
      this.field.store = value;
      this.CRUD.emit('Toggled store of ' + this.field.name);
    }
  }

  changeInstant(value: boolean): void {
    if (this.field){
      this.field.instant = value;
      this.CRUD.emit('Toggled instant of ' + this.field.name);
    }
  }

  changeRequired(value: boolean): void {
    if (this.field){
      this.field.required = value;
      this.CRUD.emit('Toggled required of ' + this.field.name);
    }
  }

  changeMultilang(value: boolean): void {
    if (this.field){
      this.field.multilang = value;
      this.CRUD.emit('Toggled multilang of ' + this.field.name);
    }
  }

  changeHasDefault(value: boolean): void {
    if (this.field){
      this.field._hasDefault = value;
      this.CRUD.emit('Toggled default of ' + this.field.name);
    }
  }

  changeHasSelection(value: boolean): void {
    if (this.field){
      this.field._hasSelection = value;
      this.CRUD.emit('Toggled selection of ' + this.field.name);
    }
  }

  changeDefault(value: any): void {
    if (this.field){
      this.field.default = value;
      this.CRUD.emit('Changed default of ' + this.field.name);
    }
  }

  changeRelTable(value: string): void {
    if (this.field){
      this.field.relTable = value;
      this.field.default = undefined;
      this.field.selection = [];
      this.CRUD.emit('Changed relTable of ' + this.field.name);
    }
  }

  changeRelLocalKey(value: string): void {
    if (this.field){
      this.field.relLocalKey = value;
      this.CRUD.emit('Changed relLocalKey of ' + this.field.name);
    }
  }

  changeRelForeignKey(value: string): void {
    if (this.field){
      this.field.relForeignKey = value;
      this.field.default = undefined;
      this.field.selection = [];
      this.CRUD.emit('Changed relForeignKey of ' + this.field.name);
    }
  }

  public changeAlias(value: string): void {
    if (this.field){
      this.field.alias = value;
      this.CRUD.emit('Changed alias of ' + this.field.name);
    }
  }

  public addToSelection(): void {
    if (this.field && !this.field.isUneditable) {
      this.field.selection.push(undefined);
    }
  }

  public deleteSelection(index: number): void {
    if (this.field && !this.field.isUneditable) {
      this.field.selection.splice(index, 1);
    }
  }

  changeHasDependencies(value: boolean): void {
    if (this.field){
      this.field._hasDependencies = value;
      this.CRUD.emit('Toggled dependencies of ' + this.field.name);
    }
  }

  changeHasVisible(value: boolean): void {
    if (this.field){
      this.field._hasVisible = value;
      this.CRUD.emit('Toggled visible of ' + this.field.name);
    }
  }

  changeHasDomain(value: boolean): void {
    if (this.field){
      this.field._hasDomain = value;
      this.CRUD.emit('Toggled domain of ' + this.field.name);
    }
  }

  changeOnUpdate(value: string): void {
    if (this.field) {
      this.field.onUpdate = value;
      this.CRUD.emit('changed onupdate of ' + this.field.name);
    }
  }

  changeOnRevert(value: string): void {
    if (this.field) {
      this.field.onRevert = value;
      this.CRUD.emit('changed onrevert of ' + this.field.name);
    }
  }

  changeOnDelete(value: string): void {
    if (this.field) {
      this.field.onDelete = value;
      this.CRUD.emit('changed onDelete of ' + this.field.name);
    }
  }

  changeOnDetach(value: string): void {
    if (this.field) {
      this.field.onDetach = value;
      this.CRUD.emit('changed onDetach of ' + this.field.name);
    }
  }

  changeVisible(value: any): void {
    if (this.field) {
      this.field.visible = value;
      this.CRUD.emit('changed visibility of ' + this.field.name);
    }
  }

  changeDomain(value: any): void {
    if (this.field) {
      this.field.domain = value;
      this.CRUD.emit('changed domain of ' + this.field.name);
    }
  }

  public addToDependencies(): void {
    if (this.field && !this.field.dependencies.includes(this.dependencyInput) && this.dependencyInput) {
      this.field.dependencies.push(this.dependencyInput);
      this.dependencyInput = '';
      this.CRUD.emit('added dependency to ' + this.field.name);
    }
  }

  public DeleteDependency(index: number): void {
    this.field?.dependencies.splice(index, 1);
    this.CRUD.emit('deleted dependency to ' + this.field?.name);
  }

  public changeSelection(index: number, value: any): void {
    if (this.field && !this.field.isUneditable){
      this.field.selection[index] = value;
      this.CRUD.emit('changed value of selection');
    }
  }

  noCancel(event: KeyboardEvent): void {
    if ( event.key === 'z' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if ( event.key === 'y' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  navigateToParent(): void {
    this.navToParent.emit();
  }

}
