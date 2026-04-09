import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewPreDefAction } from '../../../../_objects/View';

@Component({
  selector: 'app-predef-action-editor',
  templateUrl: './predef-action-editor.component.html',
  styleUrls: ['./predef-action-editor.component.scss']
})
export class PreDefActionEditorComponent implements OnInit {

  @Input() obj: ViewPreDefAction;
  @Input() controllers: string[];
  @Input() groups: string[] = [];
  @Input() entity: string;
  @Input() ids: string[];

  @Output() delete = new EventEmitter<void>();

  bigDisp = false;

  input = '';


  filteredOptions: string[];

  filteredGroups: string[];

  constructor(
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.filteredOptions = ['', ...this.controllers];
  }

  deleteMe(): void {
    this.delete.emit();
  }

  tap(newValue: string): void {
    this.filteredOptions = ['', ...this.controllers.filter((val) => (val.toLowerCase().includes(this.obj.controller)))];
  }

  tap2(newValue: string): void {
    this.input = newValue;
    this.filteredGroups = this.groups.filter((val) => (val.toLowerCase().includes(this.input)));
  }

  addGroup(): void {
    const index = this.obj.access.groups.indexOf(this.input);
    if (index === -1 && this.input.trimStart() !== '') {
      this.obj.access.groups.push(this.input);
    }
    this.input = '';
  }

  delete_element(group: string): void {
    const index = this.obj.access.groups.indexOf(group);
    this.obj.access.groups.splice(index, 1);
  }

  changeBigDispBy(bool: boolean): void {
    if (bool){
      this.bigDisp = true;
    }
  }
}
