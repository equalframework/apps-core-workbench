import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewSection } from '../../../../_objects/View';
import { GroupEditorComponent } from '../../group-editor.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-edit-section',
  templateUrl: './edit-section.component.html',
  styleUrls: ['./edit-section.component.scss']
})
export class EditSectionComponent implements OnInit {
  editingSection: ViewSection;

  constructor(
    @Optional() public dialogRef: MatDialogRef<GroupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{section:ViewSection,entity:string, package:string}
  ) {
    this.editingSection = cloneDeep(data.section);
  }

  ngOnInit(): void {
    console.log(this.data)
  }

}