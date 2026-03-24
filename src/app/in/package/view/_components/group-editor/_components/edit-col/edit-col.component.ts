import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewColumn, ViewRow } from '../../../../_objects/View';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-edit-col',
  templateUrl: './edit-col.component.html',
  styleUrls: ['./edit-col.component.scss']
})
export class EditColComponent implements OnInit {
  editingCol: ViewColumn;

  constructor(
    @Optional() public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{col:ViewColumn,entity:string, package:string}
  ) {
    this.editingCol = cloneDeep(data.col);
  }

  parseInt = parseInt
    
  ngOnInit(): void {
    console.log(this.data)
  }

}
