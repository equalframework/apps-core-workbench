import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-pipeline-loader',
    templateUrl: './pipeline-loader.component.html',
    styleUrls: ['./pipeline-loader.component.scss']
})
export class PipelineLoaderComponent {

    constructor(
        public dialogRef: MatDialogRef<PipelineLoaderComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { pipeline: string, pipelines: string[] },
    ) { }

    onClose(): void {
        this.dialogRef.close();
    }
}
