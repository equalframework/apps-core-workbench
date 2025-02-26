import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
    selector: 'delete-confirmation-dialog',
    templateUrl: './delete-confirmation-dialog.component.html'
})
export class DeleteConfirmationDialogComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: EqualComponentDescriptor,
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    ) {}

    onclickNo(): void {
        this.dialogRef.close(false);
    }

    deleteComponent(){
        this.dialogRef.close(true);
    }
    ngOnInit(): void {
    }
}
