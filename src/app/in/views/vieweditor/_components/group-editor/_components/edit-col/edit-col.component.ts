import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewColumn, ViewRow } from '../../../../_objects/View';

@Component({
  selector: 'app-edit-col',
  templateUrl: './edit-col.component.html',
  styleUrls: ['./edit-col.component.scss']
})
export class EditColComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{col:ViewColumn,entity:string}
  ) { }

  ngOnInit(): void {
    console.log(this.data)
  }

}
