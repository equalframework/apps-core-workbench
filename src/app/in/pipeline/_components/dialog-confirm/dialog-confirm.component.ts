import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.scss']
})
export class DialogConfirmComponent {
  constructor(
    @Optional() public dialogRef: MatDialogRef<DialogConfirmComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
  ) {}

}
