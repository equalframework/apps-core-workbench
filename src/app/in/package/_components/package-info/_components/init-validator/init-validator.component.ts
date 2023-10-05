import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-init-validator',
  templateUrl: './init-validator.component.html',
  styleUrls: ['./init-validator.component.scss']
})
export class InitValidatorComponent implements OnInit {

  imprt = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public data:{package:string},
    public dialogRef: MatDialogRef<InitValidatorComponent>
  ) { }

  ngOnInit(): void {
  }

}
