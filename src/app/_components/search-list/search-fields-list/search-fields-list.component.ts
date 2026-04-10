import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldClassArray } from '../../../in/package/models/_object/FieldClassArray';
import { FieldClass } from '../../../in/package/models/_object/FieldClass';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'app-search-fields-list',
    templateUrl: './search-fields-list.component.html',
    styleUrls: ['./search-fields-list.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})

/**
 * #memo - This component does not make a distinction between inherited fields and native ones
 * Route `package/:package_name/model/:class_name/` uses its own field-editor-list
 */

/**
 * @see SearchListComponent
 * @see FieldClass
 * Supercharged version of SearchListComponent to display FieldClass element
 */
export class SearchFieldsListComponent implements OnInit {

    // Selected node of the list (consistent with node_type, if provided): parent might force the selection of a node (goto)
    @Input() selectedNode?: FieldClass;

    @Input() packageName = '';

    // name of the Entity with full namespace for which fields are displayed
    @Input() className = '';

    @Output() selectNode = new EventEmitter<FieldClass>();
    @Output() deleteNode = new EventEmitter<FieldClass>();
    @Output() updateNode = new EventEmitter<string>();
    @Output() createNode = new EventEmitter<string>();

    // Array of fields fetched from server (schema)
    public elements: FieldClass[] = [];

    public loading = false;

    // filtered derivative of `elements` with purpose to be displayed
    public filteredData: FieldClass[];

    // input value for new field creation
    public inputValue = '';

    // value part of the search bar field (parsed in onSearch() method)
    public searchValue = '';

    // used to render info about components present in filteredData (or data)
    public fieldsDict: {[id: string]: boolean};

    public editingNode: FieldClass;
    public editedNode: FieldClass;

    constructor(
            private workbenchService: WorkbenchService,
            private dialog: MatDialog,
            private snackBar: MatSnackBar
        ) { }

    public async ngOnInit(): Promise<void> {
        this.loading = true;

        await this.loadNodes();

        this.loading = false;
    }

    public ngOnChanges(): void {
        try {
            this.fieldsDict = {};
            this.elements.forEach((field) => { this.fieldsDict[field.name] = field.inherited; });
        }
        catch {
            this.fieldsDict = {};
        }
        if (Array.isArray(this.elements)) {
            this.filteredData = [...this.elements];
        }
    }

    private  loadNodes(): void {
        this.workbenchService.getSchema(this.className).subscribe((schema) => {
            for (const item in schema['fields']) {
                const field = schema['fields'][item];
                this.elements.push(new FieldClass(field.name));
            }
        });
    }

    /**
     * Will update filterData with the new filter.
     *
     * @param value value of the filter
     */
    public onSearch(value: string): void {
        this.searchValue = value;
        this.filteredData = this.elements.filter(node => node.name.toLowerCase().includes(value.toLowerCase()));
    }

    /**
     * Notify parent component of the selected node.
     *
     * @param node value of the node which is clicked on
     */
    public onclickSelect(node: FieldClass): void {
        if (node.inherited) {
            this.snackBar.open('This field is inherited.', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }
        this.selectNode.emit(node);
    }

    /**
     * Notify the parent component of the deleted node.
     *
     * @param node value of the node which is deleted
     */
    public onclickDelete(node: FieldClass): void {
        const name = node.name;

        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
            data: { name },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const index = this.elements.indexOf(node);
                const indexFilteredData = this.filteredData.indexOf(node);
                if (index >= 0 && indexFilteredData >= 0) {
                    let timerId: any;
                    timerId = setTimeout(() => {
                        this.deleteNode.emit(node);
                        this.filteredData.splice(indexFilteredData, 1);
                    }, 1000);
                    this.snack('Deleted', timerId);
                    return;
                }
            }
        });
    }

    /**
     * Update the editingNode and editedNode value to match the node.
     *
     * @param node name of the node which is edited
     */
    public onEditNode(node: FieldClass): void {
        this.editingNode = node;
        this.editedNode = node;
    }

    public onclickCancelEdit(): void {
        this.editingNode.name = '__invalidated';
    }

    public onclickCreate(): void {
        if (!this.inputValue.replaceAll(' ', '').length) {
            this.snackBar.open('You can\'t make a field with an empty name.');
            return;
        }

        this.createNode.emit(this.inputValue);
        this.inputValue = '';

        setTimeout(() => {
                this.filteredData = this.elements.filter(node => node.name.toLowerCase().includes(this.searchValue.toLowerCase()));
            }, 1000);

    }

    public snack(text: string, timerId: number): void {
        this.snackBar.open(text, 'Undo', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            })
            .onAction().subscribe(() => {
                clearTimeout(timerId);
            });
    }

    public reformatTextCreate(): void {
        this.inputValue = this.inputValue.replace(' ', '-');
    }

    public reformatTextRename(node: FieldClass): void {
        node.name = node.name.replace(' ', '-');
        node.checkSync();
    }

    public areNodesEqual(node1: FieldClass, node2: FieldClass | undefined): boolean {
        // console.log('comparing', node1, node2);
        return (node1?.name === node2?.name);
    }

    public cloneNode(node: FieldClass): FieldClass {
        return new FieldClass(
                node.name,
                node.inherited,
                node.isSynchronized,
                JSON.parse(JSON.stringify(node.currentScheme ?? {}))
            );
    }

}
