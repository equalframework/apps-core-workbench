import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewRow } from '../../../../_objects/View';

@Component({
  selector: 'app-edit-row',
  templateUrl: './edit-row.component.html',
  styleUrls: ['./edit-row.component.scss']
})
export class EditRowComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:ViewRow
  ) { }

  ngOnInit(): void {
    console.log(this.data)
  }

}
