import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
    selector: 'request-sending-dialog',
    templateUrl: './request-sending-dialog.component.html',
    styleUrls: ['./request-sending-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RequestSendingDialogComponent implements OnInit {

    public response_info: string;
    public error_message: string = '';
    public bodyHtml: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<RequestSendingDialogComponent>
    ) {}

    public ngOnInit(): void {
        // Compute and store the values only once when the component is initialized.
        this.bodyHtml = this.computeJSONSchema();
        console.log(this.bodyHtml)
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    /**
     * Computes the JSON schema and updates the component properties.
     * @returns A pretty HTML string representing the JSON schema.
     */
    public computeJSONSchema(): string {
        if (!this.data) {
            return "NO RESPONSE";
        }
        console.log("data : ", this.data);
        // Check if success is true or false
        if (this.data.success) {
            this.response_info = "<label>success</label>";
            return this.data.response ? this.prettyPrint(this.data.response) : "this response has no body.";
        } else {
            console.log(this.data);
            this.response_info = "<label>error</label>";
            this.error_message = this.data.message
                ? this.prettyPrint(this.data.message)
                : '';
            return this.data.response && this.data.response.error
                ? this.data.response.error.text.replaceAll("\n", "<br>")
                : this.prettyPrint(this.data.response.error);
        }
    }


    /**
     * Pretty prints a JSON object as an HTML string.
     * @param input A JSON object.
     * @returns An HTML string.
     */
    private prettyPrint(input: any): string {
        return prettyPrintJson.toHtml(input);
    }
}
