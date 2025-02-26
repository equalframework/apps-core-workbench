import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileSaverComponent } from '../file-saver/file-saver.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'app-file-loader',
    templateUrl: './file-loader.component.html',
    styleUrls: ['./file-loader.component.scss']
})
export class FileLoaderComponent implements OnInit {

    constructor(
        @Optional() public dialogRef: MatDialogRef<FileSaverComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data:{path:string},
        private workbenchService:WorkbenchService
    ) {}

    list:{[id:string]:string[]} = {};

    filtered_list:string[] = []

    value:string = ""

    async ngOnInit() {
        this.list = await this.workbenchService.getUMLList("erd").toPromise();
        this._filter("")
    }

    private _filter(value:string) {
        let temp = []
        for(let pkg in this.list) {
            for(let item of this.list[pkg]) {
                temp.push(pkg+"::"+item)
            }
        }
        this.filtered_list = temp.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    }

}
