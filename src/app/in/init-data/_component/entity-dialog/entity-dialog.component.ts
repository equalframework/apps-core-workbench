import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-entity-dialog',
  templateUrl: './entity-dialog.component.html',
  styleUrls: ['./entity-dialog.component.scss']
})
export class EntityDialogComponent implements OnInit {

  public selectedModel:string = '';

  get filteredModel() {
    return this.data.model.filter(item => !this.data.model_taken.includes(item))
  }

  public fmodel:string[];

  constructor(
        @Optional() public dialogRef:MatDialogRef<EntityDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data:{model:string[], model_taken:string[]}) {
    console.log(data);
    this.fmodel = this.filteredModel;
  }

  ngOnInit(): void {
  }

}
