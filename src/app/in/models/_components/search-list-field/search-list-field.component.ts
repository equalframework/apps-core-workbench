import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from '../search-list/_components/delete-confirmation/delete-confirmation.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldClassArray } from '../../_object/FieldClassArray';

@Component({
    selector: 'app-search-list-field',
    templateUrl: './search-list-field.component.html',
    styleUrls: ['./search-list-field.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SearchListFieldComponent implements OnInit {

    @Input() data: FieldClassArray;
    @Input() selected_node: any;
    @Output() nodeSelect = new EventEmitter<string>();
    @Output() nodeUpdate = new EventEmitter<{old_node: string, new_node: string}>();
    @Output() nodeDelete = new EventEmitter<string>();
    @Output() nodeCreate = new EventEmitter<string>();
    inheritdict:{[id:string]:boolean}
    inputValue: string;
    filteredData: string[];
    editingNode: string = "";
    editedNode: string = "";

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar
        ) { }

    public ngOnInit(): void {
        console.log("ngOnInit search list");
    }

    public ngOnChanges() {
        this.inheritdict = this.data.getInheritDict()
        if (Array.isArray(this.data)) {
            this.filteredData = [...this.data.getNameList()];
        }
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string) {
        this.filteredData = this.data.getNameList().filter(node => node.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node: string){
        // TODO
        if (this.data.getInheritDict()["node"]) {
            this.snackBar.open('This field is inherited.', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }
        this.nodeSelect.emit(node);
    }

    /**
     * Notify parent component of the updating of a node.
     *
     * @param node value of the node which is updating
     */
    public onclickNodeUpdate(node: string){
        const index = this.data.getNameList().indexOf(this.editingNode);
        const index_filtered_data = this.filteredData.indexOf(this.editingNode);

        if (index >= 0 && index_filtered_data >= 0) {
            let timerId: any;
            timerId = setTimeout(() => {
                this.nodeUpdate.emit({old_node: node, new_node: this.editedNode});
            }, 5000);
            this.snack("Updated", timerId);
            this.cancelEdit();
        }
    }

    /**
     * Notify the parent component of the deleted node.
     *
     * @param node value of the node which is deleted
     */
    public deleteNode(node: string){
        const index = this.data.getNameList().indexOf(node);
        const index_filtered_data = this.filteredData.indexOf(node);

        if (index >= 0 && index_filtered_data >= 0) {
            let timerId: any;
            timerId = setTimeout(() => {
                this.nodeDelete.emit(node);
            }, 5000);
            this.snack("Deleted", timerId);
        }
    }

    /**
     * Open a pop-up if delete icon is clicked.
     *
     * @param node name of node that the user want to delete
     */
    public openDeleteConfirmationDialog(node: any) {
        const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
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
        console.log("inputvalue:"+this.inputValue)
        this.nodeCreate.emit(this.inputValue);
        this.inputValue = ""
    }

    public snack(text: string, timerId: number) {
        this.snackBar.open(text, 'Undo', {
            duration: 5000,
            horizontalPosition: 'left',
            verticalPosition: 'bottom'
        }).onAction().subscribe(() => {
            clearTimeout(timerId);
        })
    }
}
