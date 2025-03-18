import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
  selector: 'app-jsonator',
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss']
})
export class JsonViewerComponent implements OnInit {
  constructor(
    @Optional() public dialogRef: MatDialogRef<JsonViewerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  rawData:any;
    ngOnInit(): void {
        this.rawData = JSON.stringify(this.data, null, 2);
    }

  get formattedJson(): string {
    return this.data ? prettyPrintJson.toHtml(this.data) : '';
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
