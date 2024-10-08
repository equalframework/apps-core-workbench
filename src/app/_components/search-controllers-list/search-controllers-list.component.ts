import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/_modules/workbench.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
    selector: 'search-controllers-list',
    templateUrl: './search-controllers-list.component.html',
    styleUrls: ['./search-controllers-list.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})
export class SearchControllersListComponent implements OnInit {

    @Input() data: any;
    @Input() selected_node?: EqualComponentDescriptor;

    @Output() selectNode = new EventEmitter<EqualComponentDescriptor>();

    @Output() nodeUpdate = new EventEmitter<{type: string, old_node: string, new_node: string}>();
    @Output() nodeDelete = new EventEmitter<{type: string, name: string}>();
    @Output() nodeCreate = new EventEmitter<{type: string, name: string}>();

    public inputValue: string;
    public filteredData: any;
    public editingNode: string = '';
    public editedNode: string = '';
    public data_selected = true;

    public search_value = '';

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar
        ) { }

    public ngOnInit(): void {
        this.onSearch('');
    }

    public ngOnChanges() {
        this.onSearch(this.search_value);
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string) {
        this.search_value = value
        if(this.data_selected) {
            this.filteredData = Object.values(this.data['data']).filter((node: any) => node.toLowerCase().includes(value.toLowerCase()));
        }
        else {
            this.filteredData = Object.values(this.data['actions']).filter((node: any) => node.toLowerCase().includes(value.toLowerCase()));
        }
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickNodeSelect(node: string){
        if(this.data_selected) {
            this.selectNode.emit(<EqualComponentDescriptor>{type: 'get', name: node});
        }
        else {
            this.selectNode.emit(<EqualComponentDescriptor>{type: 'do', name: node});
        }
    }

    /**
     * Notify parent component of the updating of a node.
     *
     * @param node value of the node which is updating
     */
    public onclickNodeUpdate(node: string){
        let index;
        let index_filtered_data;
        if(this.data_selected) {
            index = this.data['data'].indexOf(this.editingNode);
            index_filtered_data = this.filteredData.indexOf(this.editingNode);
        }
        else {
            index = this.data['actions'].indexOf(this.editingNode);
            index_filtered_data = this.filteredData.indexOf(this.editingNode);
        }

        if (index >= 0 && index_filtered_data >= 0) {
            let timerId: any = setTimeout(() => {
                    if(this.data_selected) {
                        this.nodeUpdate.emit({type: 'get', old_node: node, new_node: this.editedNode});
                    }
                    else {
                        this.nodeUpdate.emit({type: 'do', old_node: node, new_node: this.editedNode});
                    }
                },
                5000);
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
        let index;
        let index_filtered_data;
        if(this.data_selected) {
            index = this.data['data'].indexOf(node);
            index_filtered_data = this.filteredData.indexOf(node);
        } else {
            index = this.data['actions'].indexOf(this.editingNode);
            index_filtered_data = this.filteredData.indexOf(node);
        }
        if (index >= 0 && index_filtered_data >= 0) {
            if(this.data_selected) {
                this.nodeDelete.emit({type: 'get', name: node});
            } else {
                this.nodeDelete.emit({type: 'do', name: node});
            }
        }
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
        let timerId: any;
        if(this.data_selected) {
            this.nodeCreate.emit({type: 'get', name: this.inputValue});
        } else {
            this.nodeCreate.emit({type: 'do', name: this.inputValue});
        }
        this.inputValue = ""
    }

    public dataSelected(value: boolean) {
        this.data_selected = value;
        this.onSearch('');
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
