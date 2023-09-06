import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from '../search-list/_components/delete-confirmation/delete-confirmation.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldClassArray } from '../../_object/FieldClassArray';
import { FieldClass } from '../../_object/FieldClass';

@Component({
    selector: 'app-search-list-field',
    templateUrl: './search-list-field.component.html',
    styleUrls: ['./search-list-field.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SearchListFieldComponent implements OnInit {

    @Input() data: FieldClassArray;
    @Input() selected_node: FieldClass|undefined;
    @Output() nodeSelect = new EventEmitter<FieldClass>();
    @Output() nodeUpdate = new EventEmitter<{old_node: string, new_node: string}>();
    @Output() nodeDelete = new EventEmitter<string>();
    @Output() nodeCreate = new EventEmitter<string>();
    inheritdict:{[id:string]:boolean}
    inputValue: string;
    filteredData: FieldClass[];
    editingNode: FieldClass|undefined = undefined;
    editedNode: FieldClass|undefined = undefined;

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar
        ) { }

    public ngOnInit(): void {
        console.log("ngOnInit search list");
    }

    public ngOnChanges() {
        try {
            this.inheritdict = this.data.getInheritDict()
        } catch {
            this.inheritdict = {}
        }
        if (Array.isArray(this.data)) {
            this.filteredData = [...this.data];
        }
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string) {
        this.filteredData = this.data.filter(node => node.name.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node:FieldClass){
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
        var index:number = -1
        var index_filtered_data:number = -1
        if(this.editingNode !== undefined) {
            index = this.data.indexOf(this.editingNode);
            index_filtered_data = this.filteredData.indexOf(this.editingNode);
        }
        if(this.editedNode !== undefined) {
            var name = this.editedNode.name
            if (index >= 0 && index_filtered_data >= 0) {
                let timerId: any;
                timerId = setTimeout(() => {
                    this.nodeUpdate.emit({old_node: node, new_node: name});
                }, 5000);
                this.snack("Updated", timerId);
                this.cancelEdit();
            }
        }
    }

    /**
     * Notify the parent component of the deleted node.
     *
     * @param node value of the node which is deleted
     */
    public deleteNode(node:FieldClass){
        const index = this.data.indexOf(node);
        const index_filtered_data = this.filteredData.indexOf(node);

        if (index >= 0 && index_filtered_data >= 0) {
            let timerId: any;
            timerId = setTimeout(() => {
                this.nodeDelete.emit(node.name);
            }, 5000);
            this.snack("Deleted", timerId);
        }
    }

    /**
     * Open a pop-up if delete icon is clicked.
     *
     * @param node name of node that the user want to delete
     */
    public openDeleteConfirmationDialog(node:FieldClass) {
        var name = node.name
        const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
            data: { name },
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
    public onEditNode(node:FieldClass) {
        this.editingNode = node;
        this.editedNode = node;
    }

    public onCancelEdit() {
        this.cancelEdit();
    }

    private cancelEdit() {
        this.editingNode = undefined;
        this.editedNode = undefined;
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
