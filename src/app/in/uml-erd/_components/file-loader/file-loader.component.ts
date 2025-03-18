import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'app-file-loader',
    templateUrl: './file-loader.component.html',
    styleUrls: ['./file-loader.component.scss']
})
export class FileLoaderComponent implements OnInit {

    constructor(
        @Optional() public dialogRef: MatDialogRef<FileLoaderComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { path: string },
        private workbenchService: WorkbenchService
    ) {}

    // Directly store the observable here, no need for manual subscription in TS
    umlExplorator$: Observable<{ [id: string]: string[] }>;

    selectedFolder: string | null = null;                     // Selected folder
    selectedUml: string | null = null;                        // Selected UML
    filteredUmls: string[] = [];                              // Filtered UMLs to display

    ngOnInit() {
        this.loadUmlExplorator();
    }

    // This method is now only used to load the observable.
    private loadUmlExplorator() {
        this.umlExplorator$ = this.workbenchService.getUMLList('erd');  // Replace with your generic type if needed
    }

    // When the user selects a folder, show the associated UMLs
    onSelectFolder(folderName: string) {
        this.selectedFolder = folderName;
        this.selectedUml = null; // Reset UML selection
    }

    // When the user selects a UML
    onSelectUml(uml: string) {
        this.selectedUml = uml;
    }

    // Check if a folder is selected
    isFolderSelected(folderName: string): boolean {
        return this.selectedFolder === folderName;
    }
}
