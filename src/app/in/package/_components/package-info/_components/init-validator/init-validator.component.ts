import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-init-validator',
  templateUrl: './init-validator.component.html',
  styleUrls: ['./init-validator.component.scss']
})
export class InitValidatorComponent implements OnInit {

  imprt = false
  csd = true
  impcsd = false

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data:{package:string},
    @Optional() public dialogRef: MatDialogRef<InitValidatorComponent>
  ) { }

  ngOnInit(): void {
  }

}
