import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Param, Usage } from '../../../../../_models/Params';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-param-side-pane',
  templateUrl: './param-side-pane.component.html',
  styleUrls: ['./param-side-pane.component.scss']
})
export class ParamSidePaneComponent implements OnInit, OnChanges {

  @Input() param: Param | null | undefined;
  @Input() types: string[];
  @Input() usages: string[];
  @Input() scheme: { [id: string]: any };
  @Input() modelList: string[] = [];
  @Input() package = '';
  @Input() entityName = '';

  filteredModelList: string[];

  alert = alert;


  @Output() CRUD = new EventEmitter<string>();

  protected nameEdit = true;


  foreignControl = new FormControl('', {
    validators: []
  });

  nameControl = new FormControl('', {
    validators: [snake_case, Validators.required, Validators.max(32)]
  });

  tmpUsage = '';

  constructor(
  ) { }

  ngOnInit(): void {
    this.filteredModelList = this.modelList;
    this.foreignControl.valueChanges.subscribe((value: string) => {
      if (!value) {
        this.filteredModelList = this.modelList;
        return;
      }
      this.changeForeign();
      this.filteredModelList = this.modelList.filter(
        (item: string) => item.toLowerCase().includes(value.toLowerCase()))
        .sort((p1: string, p2: string) => p1.localeCompare(p2));
    });

    // auto-save name as the user types (keeps behavior consistent with other editable fields)
    this.nameControl.valueChanges.subscribe((value: string) => {
      if (!this.param) {
        return;
      }
      if (this.nameControl.valid && value !== this.param.name) {
        const oldname = this.param.name;
        this.param.name = value;
        this.CRUD.emit('Renaming ' + oldname + ' to ' + this.param.name);
      }
    });
  }

  ngOnChanges(): void {
    this.foreignControl.clearValidators();
    this.foreignControl.addValidators((control: AbstractControl) => {
      if (this.modelList && Array.isArray(this.modelList) && this.modelList.includes(control.value)) {
        return null;
      } else {
        return { case: true };
      }
    });
    this.foreignControl.setValue(this.param?.foreign_object, {emitEvent: false});
    // keep name input in sync when the param changes without triggering valueChanges
    this.nameControl.setValue(this.param?.name, {emitEvent: false});
  }

  public setNameBeingEdited(value: boolean): void {
    this.nameEdit = value;
    if (value) {
      this.nameControl.setValue(this.param?.name);
    } else {
      this.nameControl.markAsUntouched();
    }
  }

  get nameBeingEdited(): boolean {
    return this.nameEdit;
  }

  public changeName(): void {
    if (this.param && this.nameControl.valid) {
      const oldname = this.param.name;
      this.param.name = this.nameControl.value;
      this.CRUD.emit('Renaming ' + oldname + ' to ' + this.param.name);
      this.nameControl.markAsUntouched();
    }
  }

  public changeTypeValue(value: string): void {
    if (this.param) {
      this.param.type = value;
      this.param.default = undefined;
      this.param.selection = [];
      if (value !== 'many2many' && value !== 'one2many' && value !== 'many2one') {
        this.param._has_domain = false;
      }
      this.CRUD.emit('changed type of ' + this.param.name + ' to ' + this.param.type);
    }
  }



  public changeRequired(checked: boolean): void {
    if (this.param) {
      this.param.required = checked;
      this.CRUD.emit('Set required to ' + checked + ' for param ' + this.param.name);
    }

  }

  public changeDesc(value: string): void {
    if (this.param) {
      this.param.description = value;
      this.CRUD.emit('Changed description of ' + this.param.name);
    }
  }

  public change_has_default(checked: boolean): void {
    if (this.param) {
      this.param._has_default = checked;
      this.CRUD.emit('Toggled default of ' + this.param.name);
    }

  }

  public change_visibility(checked: boolean): void {
    if (this.param) {
      this.param._visibility = checked;
      this.CRUD.emit('Toggled visibility of ' + this.param.name);
    }

  }

  public change_has_selection(checked: boolean): void {
    if (this.param) {
      this.param._has_selection = checked;
      this.CRUD.emit('Toggled selection of ' + this.param.name);
    }

  }

  public change_has_domain(checked: boolean): void {
    if (this.param) {
      this.param._has_domain = checked;
      this.CRUD.emit('Toggled domain of ' + this.param.name);
    }

  }

  public changeVisible_Domain(domain: any): void {
    if (this.param) {
      this.param.visible_domain = domain;
      this.CRUD.emit('Changed domain of ' + this.param.name);
    }
  }

  public changeForeign(): void {
    if (this.foreignControl.invalid) {
      return;
    }
    if (this.param) {
      if (this.param.foreign_object === this.foreignControl.value) {
        return;
      }
      this.param.foreign_object = this.foreignControl.value;
      this.param.domain = [];
      this.CRUD.emit('changed foreign object of ' + this.param.name + ' to ' + this.foreignControl.value);
    }
  }


  public changeDefault(value: any): void {
    if (this.param) {
      this.param.default = value;
      this.CRUD.emit('Changed default value of ' + this.param.name);
    }
  }

  public change_visibility_is_domain(value: boolean): void {
    if (this.param) {
      this.param._visibility_is_domain = value;
      this.CRUD.emit('Changed visibility type of ' + this.param.name);
    }
  }

  public changeVisible_bool(value: boolean): void {
    if (this.param) {
      this.param.visible_bool = value;
      this.CRUD.emit('Changed visibility of ' + this.param.name + ' to ' + value);
    }
  }

  public addToSelection(): void {
    if (this.param) {
      this.param.selection.push(undefined);
      this.CRUD.emit('Added to selection for ' + this.param.name);
    }
  }

  public deleteSelection(index: number): void {
    if (this.param && index >= 0 && index < this.param.selection.length) {
      this.param.selection.splice(index, 1);
      this.CRUD.emit('Deleted selection for ' + this.param.name);
    }
  }

  public noCancel(event: KeyboardEvent): void {
    if (event.key === 'z' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.key === 'y' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

}

function snake_case(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;

  if (!value) {
    return { case: true };
  }
  // Ensure no leading or trailing underscores
  if (value.startsWith('_') || value.endsWith('_')) {
    return { case: true };
  }

  // Ensure no consecutive underscores
  if (value.includes('__')) {
    return { case: true };
  }
  const validChars = /^[a-z_]+$/;
  if (!validChars.test(value)) {
    return { case: true };
  }
  return null;
}
