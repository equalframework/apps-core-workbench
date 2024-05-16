import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'sb-shared-lib';

@Component({
    selector: 'app-modal-execution-pipeline',
    templateUrl: './modal-execution-pipeline.component.html',
    styleUrls: ['./modal-execution-pipeline.component.scss']
})
export class ModalExecutionPipelineComponent {

    constructor(
        public dialogRef: MatDialogRef<ModalExecutionPipelineComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { pipelineName: string, pipelineId: number },
        private api: ApiService,
    ) { }

    async runPipeline() {
        await this.api.get("?get=core_run-pipeline", { pipeline_id: this.data.pipelineId });
    }

    onClose(): void {
        this.dialogRef.close();
    }

}
