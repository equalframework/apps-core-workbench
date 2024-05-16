import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Node } from '../../_objects/Node';

@Component({
    selector: 'app-modal-name-description',
    templateUrl: './modal-name-description.component.html',
    styleUrls: ['./modal-name-description.component.scss']
})
export class ModalNameDescriptionComponent {

    public isValid: boolean = true;

    constructor(
        public dialogRef: MatDialogRef<ModalNameDescriptionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { nodes: Node[], oldName: string, name: string, description: string },
    ) { }

    onClose(): void {
        this.dialogRef.close();
    }

    public isNameValid() {
        this.isValid = this.data.oldName === this.data.name || !this.data.nodes.some(node => node.name === this.data.name);
    }
}
