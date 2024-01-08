import { Component, Inject, OnInit, Optional } from '@angular/core';
import { InitDataEntityInstance } from '../../_objects/init-data';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-init-popup-editor',
  templateUrl: './init-popup-editor.component.html',
  styleUrls: ['./init-popup-editor.component.scss']
})
export class InitPopupEditorComponent implements OnInit {

  json = JSON

  obk = Object.keys

  selected_lang = 'en'

  constructor(
    @Optional() public ref:MatDialogRef<InitPopupEditorComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{fields:{name:string,type:string, multilang:boolean, required:boolean}[],data:InitDataEntityInstance}
  ) { }

  ngOnInit(): void {
  }
}
 