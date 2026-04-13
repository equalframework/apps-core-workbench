import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewItem } from '../../../../_objects/View';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-edit-item-form',
  templateUrl: './edit-item-form.component.html',
  styleUrls: ['./edit-item-form.component.scss']
})
export class EditItemFormComponent implements OnInit {

  types = ViewItem.typeList;
  editingItem: ViewItem;

  constructor(
    @Optional() public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: {
      item: ViewItem, 
      entity: string, 
      fields: string[], 
      groups: string[], 
      action_controllers: string[], 
      package: string,
      schema: any}
  ) {
    this.editingItem = cloneDeep(data.item);
  }

  ngOnInit(): void {
  }

}
