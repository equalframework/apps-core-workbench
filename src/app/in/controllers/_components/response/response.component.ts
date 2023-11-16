import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';

@Component({
    selector: 'app-response',
    templateUrl: './response.component.html',
    styleUrls: ['./response.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ResponseComponentSubmit implements OnInit {

    ngOnInit(): void {
    }

    responseinfo:string
    error_message:string = ""

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<ResponseComponentSubmit>
    ) {}

    onNoClick(): void {
      this.dialogRef.close();
    }

    /**
     *
     * @returns a pretty HTML string of a schema in JSON.
     */
    public getJSONSchema() {
        if(!this.data) return "NO RESPONSE";
        if(!this.data.err) {
            this.responseinfo = "<label>success</label>"
            return this.data.resp ? this.prettyPrint(this.data.resp) : "this response has no body."
            
        } else {
            console.log(this.data)
            this.responseinfo = (this.data.resp.status < 300 ? "<label>success with client side error (" : "<label>error (")+this.data.resp.status+")</label>"
            this.error_message = this.data.resp.message ? this.prettyPrint(this.data.resp.message) : ""
            return this.data.resp.error.text ? this.data.resp.error.text.replaceAll("\n","<br>") : this.prettyPrint(this.data.resp.error);
        }
        
    }

    /**
     * Function to pretty-print JSON objects as an HTML string
     *
     * @param input a JSON
     * @returns an HTML string
     */
    private prettyPrint(input: any) {
        return prettyPrintJson.toHtml(input);
    }
}
