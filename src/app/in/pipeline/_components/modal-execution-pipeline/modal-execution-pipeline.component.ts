import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-modal-execution-pipeline',
  templateUrl: './modal-execution-pipeline.component.html',
  styleUrls: ['./modal-execution-pipeline.component.scss']
})
export class ModalExecutionPipelineComponent {

  public stepResponses: { node: string, result?: any, error?: string, success: boolean }[] = [];
  public errorMessage: string | null = null;
  public isRunning = false; // Flag to disable the button while running

  constructor(
    public dialogRef: MatDialogRef<ModalExecutionPipelineComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pipelineName: string, pipelineId: number },
    private api: ApiService,
  ) { }

  // Function to execute the pipeline
  async runPipeline() {
    this.stepResponses = [];
    this.errorMessage = null;
    this.isRunning = true;

    try {
      // Making the API call to execute the pipeline
      const pipelineResponse: any = await this.api.get(`?get=core_run-pipeline`, { pipeline_id: this.data.pipelineId });

      // Process the pipeline response step by step
      for (const nodeName in pipelineResponse) {
        const result = pipelineResponse[nodeName];

        // If there's an error in this node, stop processing further
        if (result.error) {
          this.stepResponses.push({
            node: nodeName,
            error: result.error,
            success: false
          });
          this.errorMessage = `Error in node "${nodeName}": ${result.error}`;
          break; // Stop processing further nodes on error
        } else {
          // If the node executed successfully, store the result
          this.stepResponses.push({
            node: nodeName,
            result: result,
            success: true
          });
        }
      }

    } catch (error) {
      // If any unexpected error occurs
      this.errorMessage = 'An unexpected error occurred during pipeline execution.';
      console.error(error);
    } finally {
      // Re-enable the button after completion
      this.isRunning = false;
    }
  }

  // Function to close the modal
  onClose(): void {
    this.dialogRef.close();
  }
}
