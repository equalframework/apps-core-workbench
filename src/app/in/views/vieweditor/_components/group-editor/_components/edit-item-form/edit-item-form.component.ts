import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupEditorComponent } from '../../group-editor.component';
import { ViewItem } from '../../../../_objects/View';

@Component({
  selector: 'app-edit-item-form',
  templateUrl: './edit-item-form.component.html',
  styleUrls: ['./edit-item-form.component.scss']
})
export class EditItemFormComponent implements OnInit {

  types = ViewItem.typeList

  constructor(
    @Optional() public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{item:ViewItem,entity:string,fields:string[],groups:string[],action_controllers:string[]}
  ) { }

  ngOnInit(): void {
    console.log(this.data)
  }

}