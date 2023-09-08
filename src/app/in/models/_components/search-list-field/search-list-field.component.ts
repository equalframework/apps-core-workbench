import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from '../search-list/_components/delete-confirmation/delete-confirmation.component'
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldClassArray } from '../../_object/FieldClassArray';
import { FieldClass } from '../../_object/FieldClass';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-search-list-field',
    templateUrl: './search-list-field.component.html',
    styleUrls: ['./search-list-field.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SearchListFieldComponent implements OnInit {

    @Input() data: FieldClass[];
    @Input() selected_node: FieldClass|undefined;
    @Output() nodeSelect = new EventEmitter<FieldClass>();
    @Output() nodeDelete = new EventEmitter<FieldClass>();
    @Output() nodeCreate = new EventEmitter<string>();
    inheritdict:{[id:string]:boolean}
    inputValue: string="";
    searchvalue:string = "";
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
            this.inheritdict = {}
            this.data.forEach((field) => this.inheritdict[field.name]=field.inherited)
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
        this.searchvalue = value
        this.filteredData = this.data.filter(node => node.name.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node:FieldClass){
        // TODO
        if (node.inherited) {
            this.snackBar.open('This field is inherited.', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }
        this.nodeSelect.emit(node);
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
                this.nodeDelete.emit(node);
                this.filteredData.splice(index_filtered_data,1)
            }, 5000);
            this.snack("Deleted", timerId);
            return
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
        if(this.inputValue.replaceAll(" ","") === "") {
            this.snackBar.open("You can't make a field with an empty name.")
            return
        }
        this.nodeCreate.emit(this.inputValue);
        this.inputValue = ""
        setTimeout(() => {
            this.filteredData = this.data.filter(node => node.name.toLowerCase().includes(this.searchvalue.toLowerCase()));
        }, 1000);
        
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

    public reformatTextCreate() {
        this.inputValue = this.inputValue.replace(" ","-")
    }

    public reformatTextRename(node:FieldClass) {
        node.name = node.name.replace(" ","-")
        node.checkSync()
    }
}
