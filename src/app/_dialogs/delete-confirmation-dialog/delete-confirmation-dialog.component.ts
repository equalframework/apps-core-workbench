import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
    selector: 'delete-confirmation-dialog',
    templateUrl: './delete-confirmation-dialog.component.html',
    styleUrls: ['./delete-confirmation-dialog.component.scss'],
    encapsulation: ViewEncapsulation.Emulated

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
