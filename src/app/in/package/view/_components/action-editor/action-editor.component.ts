import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ElementRef } from '@angular/core';
import { ViewAction } from '../../_objects/View';
import { MatDialog } from '@angular/material/dialog';
import { PopupParamsComponent } from './_components/popup-params/popup-params.component';

@Component({
  selector: 'app-action-editor',
  templateUrl: './action-editor.component.html',
  styleUrls: ['./action-editor.component.scss']
})
export class ActionEditorComponent implements OnInit {
  @Input() obj: ViewAction;
  @Input() controllers: string[];
  @Input() groups: string[] = [];
  @Input() entity: string;
  @Input() actionIndex = 0;
  @Input() packageName: string;

  @Output() delete = new EventEmitter<void>();
  bigDisp = false;
  input = '';
  filteredOptions: string[];
  filteredGroups: string[];

  constructor(
    private matDialog: MatDialog,
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

  show_custom_params(): void{
    this.matDialog.open(PopupParamsComponent, {data: this.obj});
  }

  changeBigDispBy(bool: boolean): void {
    if (bool){
      this.bigDisp = true;
    }
  }
}
