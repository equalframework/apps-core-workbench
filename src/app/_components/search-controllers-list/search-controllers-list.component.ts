import { Node } from './../../in/pipeline/_objects/Node';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { DeleteConfirmationDialogComponent, MixedCreatorDialogComponent } from 'src/app/_modules/workbench.module';
import { NotificationService } from 'src/app/in/_services/notification.service';
import { ItemTypes } from 'src/app/in/_models/item-types.class';

@Component({
  selector: 'search-controllers-list',
  templateUrl: './search-controllers-list.component.html',
  styleUrls: ['./search-controllers-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SearchControllersListComponent implements OnInit, OnChanges {

  // Inputs
  @Input() package_name: string = '';
  @Input() selected_node?: EqualComponentDescriptor;

public type_dict: { [id: string]: { icon: string, disp: string } } = ItemTypes.typeDict;
  
  // Outputs
  @Output() selectNode = new EventEmitter<EqualComponentDescriptor>();
  @Output() nodeUpdate = new EventEmitter<{ type: string, old_node: string, new_node: string }>();
  @Output() nodeDelete = new EventEmitter<{ type: string, name: string }>();
  @Output() nodeCreate = new EventEmitter<{ type: string, name: string }>();

  // Full list of nodes received
  data: EqualComponentDescriptor[] = [];
  // Filtered list based on search and selected type
  filteredData: EqualComponentDescriptor[] = [];
  
  // true to display Data (type 'get'), false to display Actions (type 'do')
  data_selected: boolean = true;

  // Search and create input values
  search_value: string = '';
  inputValue: string = '';

  // For editing a node
  editingNode: EqualComponentDescriptor | null = null;
  editedNode: string = '';

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private provider: EqualComponentsProviderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.provider.getComponents(this.package_name, 'controller')
      .subscribe(components => {
        this.data = components;
        this.filterNodes();
      });
  }

  /**
   * Lifecycle hook that is called when inputs change.
   * Reapplies the filter when certain inputs change.
   * 
   * @param changes - The changes object from the lifecycle hook.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['search_value'] || changes['package_name']) {
      this.filterNodes();
    }
  }

  /**
   * Filters nodes based on the search value and selected type (Data or Actions).
   * 
   * @returns void
   */
  private filterNodes(): void {
    const searchLower = this.search_value.toLowerCase();
    if (this.data_selected) {
      // Filter nodes of type 'get' (Data)
      this.filteredData = this.data.filter(node =>
        node.type === 'get' && node.name.toLowerCase().includes(searchLower)
      );
    } else {
      // Filter nodes of type 'do' (Actions)
      this.filteredData = this.data.filter(node =>
        node.type === 'do' && node.name.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Updates the search value and reapplies the filter.
   * 
   * @param value - The new search value.
   * @returns void
   */
  onSearch(value: string): void {
    this.search_value = value;
    this.filterNodes();
  }

  /**
   * Changes the displayed type (Data or Actions) and reapplies the filter.
   * 
   * @param value - Boolean indicating whether to show Data or Actions.
   * @returns void
   */
  dataSelected(value: boolean): void {
    this.data_selected = value;
    this.filterNodes();
  }

  /**
   * Emits the event to select a node.
   * 
   * @param node - The node to be selected.
   * @returns void
   */
  onclickNodeSelect(node: EqualComponentDescriptor): void {
    this.selectNode.emit(node);
  }

  /**
   * Enters edit mode for the selected node.
   * 
   * @param node - The node that should be edited.
   * @returns void
   */
  onEditNode(node: EqualComponentDescriptor): void {
    this.editingNode = node;
    this.editedNode = node.name;
  }

  /**
   * Cancels the edit mode and resets the edited node.
   * 
   * @returns void
   */
  onCancelEdit(): void {
    this.editingNode = null;
    this.editedNode = '';
  }

  /**
   * Updates the node after editing. If the name is different,
   * it emits the update event with the old and new names.
   * 
   * @param node - The node that was edited.
   * @returns void
   */
  onclickNodeUpdate(node: EqualComponentDescriptor): void {
    if (!this.editingNode) return;
    if (this.editedNode.trim() === '' || this.editedNode === this.editingNode.name) {
      this.onCancelEdit();
      return;
    }
    const timerId = setTimeout(() => {
      this.nodeUpdate.emit({
        type: this.editingNode!.type,
        old_node: this.editingNode!.name,
        new_node: this.editedNode
      });
    }, 5000);
    this.snack("Updated", 3000);
    this.onCancelEdit();
  }

  /**
   * Deletes a node by emitting the corresponding event.
   * 
   * @param node - The node to be deleted.
   * @returns void
   */
  deleteNode(node: EqualComponentDescriptor): void {
    this.nodeDelete.emit({
      type: node.type,
      name: node.name
    });
  }

  /**
   * Opens a confirmation dialog before deleting a node.
   * 
   * @param node - The node to be deleted.
   * @returns void
   */
  openDeleteConfirmationDialog(node: EqualComponentDescriptor): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data:node 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
                if (result.success) {
                    this.notificationService.showSuccess(result.message);
                    this.removeFromComponents(result.node);
                    this.provider.refreshComponents();
                    this.filterNodes();
                    this.selectNode.emit(undefined);
                }
                else {
                    this.notificationService.showError(result.message);
                }
        }
    });
  }

  /**
   * Creates a new node (controller) by emitting the corresponding event.
   * 
   * @returns void
   */
  onclickCreate(): void {
    const newType = this.data_selected ? 'get' : 'do';
     let d = this.dialog.open(MixedCreatorDialogComponent, {
                data: {
                    node_type: newType,
                    lock_type: newType,
                    package: this.package_name,
                    lock_package: (this.package_name != '')
                },
                width: "40em",
                height: "26em"
            });
            d.afterClosed().subscribe((result) => {
                if (result) {
                    if (result.success) {
                        this.notificationService.showSuccess(result.message);
                        this.addToComponents(result.node);
                        setTimeout(() => {
                            this.provider.refreshComponents();
                        }, 10);
                    }
                    else {
                        this.notificationService.showError(result.message);
                        this.removeFromComponents(result.Node);
                    }
                }
                    this.inputValue = '';})
  }

  private addToComponents(node: EqualComponentDescriptor) {
    this.data.push(node);
    this.filterNodes()
}

private removeFromComponents(node: EqualComponentDescriptor): void {
    this.data = this.data.filter(item => item.name !== node.name);
    this.filterNodes();
}


  /**
   * Displays a notification with the option to undo the operation.
   * 
   * @param text - The message to display in the notification.
   * @param timerId - The ID of the timer for undo functionality.
   * @returns void
   */
  snack(text: string, timerId: number): void {
    this.snackBar.open(text, 'Undo', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    }).onAction().subscribe(() => {
      clearTimeout(timerId);
    });
  }
}
