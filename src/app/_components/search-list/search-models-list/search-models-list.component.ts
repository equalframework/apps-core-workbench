import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
    selector: 'search-models-list',
    templateUrl: './search-models-list.component.html',
    styleUrls: ['./search-models-list.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})

export class SearchModelsListComponent implements OnInit {

    @Input() node_selected?: EqualComponentDescriptor;

    @Output() nodeSelect = new EventEmitter<string>();
    @Output() nodeUpdate = new EventEmitter<{old_node: string, new_node: string}>();
    @Output() nodeDelete = new EventEmitter<string>();
    @Output() nodeCreate = new EventEmitter<void>();

    public inputValue: string;

    // Array of all components fetched from server
    public data: EqualComponentDescriptor[] = [];

    // filtered derivative of data with purpose to be displayed
    public filteredData: EqualComponentDescriptor[];

    public editingNode: string = "";

    public editedNode: string = "";

    public value:string = "";

    constructor(
            private dialog: MatDialog,
            private snackBar: MatSnackBar
        ) { }

    public ngOnInit(): void {
    }

    public ngOnChanges() {
        if (Array.isArray(this.data)) {
            this.filteredData = [...this.data].filter(node => node.toLowerCase().includes(this.value.toLowerCase()));
        }
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string) {
        this.value = value
        this.filteredData = this.data.filter(node => node.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node: string){
        if (this.node_selected && this.node_selected.name === node) {
            this.nodeSelect.emit(undefined);
        } else {
            this.nodeSelect.emit(node);
        }
    }
    /**
     * Notify parent component of the updating of a node.
     *
     * @param node value of the node which is updating
     */
    public onclickNodeUpdate(node: string){
        /*
        const index = this.data.indexOf(this.editingNode);
        const index_filtered_data = this.filteredData.indexOf(this.editingNode);

        if (index >= 0 && index_filtered_data >= 0) {
            let timerId: any;
            timerId = setTimeout(() => {
                    this.nodeUpdate.emit({old_node: node, new_node: this.editedNode});
                },
                5000);
            this.snack("Updated", timerId);
            this.cancelEdit();
        }
        */
    }

    /**
     * Notify the parent component of the deleted node.
     *
     * @param node value of the node which is deleted
     */
    public deleteNode(node: string){
        /*
        const index = this.data.indexOf(node);
        const index_filtered_data = this.filteredData.indexOf(node);

        if (index >= 0 && index_filtered_data >= 0) {
            this.nodeDelete.emit(node);
        }
        */
    }

    /**
     * Open a pop-up if delete icon is clicked.
     *
     * @param node name of node that the user want to delete
     */
    public openDeleteConfirmationDialog(node: any) {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
            data: { node },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deleteNode(node);
            }
        });
    }

    /**
     * Update the editingNode and editedNode value to match the node.
     *
     * @param node name of the node which is edited
     */
    public onEditNode(node: string) {
        this.editingNode = node;
        this.editedNode = node;
    }

    public onCancelEdit() {
        this.cancelEdit();
    }

    private cancelEdit() {
        this.editingNode = "";
        this.editedNode = "";
    }

    public onclickCreate() {
        this.nodeCreate.emit();
    }

    public snack(text: string, timerId: number) {
        this.snackBar.open(text, 'Undo', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        }).onAction().subscribe(() => {
            clearTimeout(timerId);
        })
    }
}
