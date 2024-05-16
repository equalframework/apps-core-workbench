import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-input',
    templateUrl: './modal-input.component.html',
    styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {

    constructor(
        public dialogRef: MatDialogRef<ModalInputComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { pair: any, value: any },
    ) { }

    store(value: any) {
        this.data.value = value;
    }

    onClose(): void {
        this.dialogRef.close();
    }
}