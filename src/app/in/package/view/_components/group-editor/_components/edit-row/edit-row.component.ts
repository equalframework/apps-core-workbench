import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewRow } from '../../../../_objects/View';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-edit-row',
  templateUrl: './edit-row.component.html',
  styleUrls: ['./edit-row.component.scss']
})
export class EditRowComponent implements OnInit {
  editingRow: ViewRow;

  constructor(
    @Optional() public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: {row: ViewRow, entity: string, package: string}
  ) {
    this.editingRow = cloneDeep(data.row);
  }

  ngOnInit(): void {
  }

}
