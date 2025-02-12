import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchV1Service } from 'src/app/in/_services/workbench-v1.service';

@Component({
    selector: 'delete-confirmation-dialog',
    templateUrl: './delete-confirmation-dialog.component.html'
})
export class DeleteConfirmationDialogComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EqualComponentDescriptor,
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
        private workbenchService : WorkbenchV1Service
    ) {}

    onclickNo(): void {
        this.dialogRef.close();
    }

    deleteComponent(){
        this.workbenchService.deleteNode(this.data).subscribe(result => {
            const resultWithNode = {
                ...result,  // Étend le résultat existant
                node: this.data  // Ajoute l'objet node au résultat
            };

            this.dialogRef.close(resultWithNode);
        });
    }
    ngOnInit(): void {
    }
}
