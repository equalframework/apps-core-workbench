import { Component, Inject, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'app-file-saver',
    templateUrl: './file-saver.component.html',
    styleUrls: ['./file-saver.component.scss']
})
export class FileSaverComponent implements OnInit {
    // array mapping all packages names with related ERD files
    public list:any =  {};
    public filtered_list:string[] = [];
    public filenameControl: FormControl;
    public packages: string[];
    public selected_package: string = 'core';
    public selected_filename: string = '';

    constructor(
        @Optional() public dialogRef: MatDialogRef<FileSaverComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data:{path:string},
        private workbenchService:WorkbenchService
    ) {
        this.filenameControl = new FormControl('', Validators.required);
    }


    async ngOnInit() {
        this.list = await this.workbenchService.getUMLList("erd");

        // we received a filename : extract parts
        if(this.data.path.length) {
            const parts = this.data.path.split("::");
            let filename: string = '';
            if(parts.length) {
                this.selected_package = parts[0];
            }
            if(parts.length > 1) {
                const file_parts = parts[1].split('.');
                if(file_parts.length > 1) {
                    filename = file_parts[0];
                }
            }
            this.onchangeFilename(filename);
        }

        this.packages = Object.keys(this.list);
        this.filenameControl.setValue(this.selected_filename);
    }

    public onchangeFilename(filename: string) {
        this.selected_filename = filename;
        this.filtered_list = [];
        // filter list to remove files extension
        if(this.list[this.selected_package] && this.list[this.selected_package].length) {
            for(let file of this.list[this.selected_package]) {
                const file_parts = file.split('.');
                if(file_parts.length > 1) {
                    file = file_parts[0];
                }
                if(!filename.length || file.includes(filename)) {
                    this.filtered_list.push(file);
                }
            }
        }
    }

}
