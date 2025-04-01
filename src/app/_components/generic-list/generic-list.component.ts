import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

/**
 * # 📝 Generic List Component
 * A reusable Angular component that displays a list of items, with options to filter, select, add, and delete items.
 *
 * ## 📌 Example Usage:
 * ```html
 * <app-generic-list
 *   [itemList]="items"
 *   [selectedItem]="selected"
 *   [icon]="'folder'"
 *   [loading]="isLoading"
 *   (select)="onSelect($event)"
 *   (addItem)="onAddItem($event)"
 *   (deleteItem)="onDeleteItem($event)"
 *   (onrefresh)="fetchItems()">
 * </app-generic-list>
 * ```
 *
 * ## 🛠️ Example in the Parent Component:
 * ```typescript
 * export class MyComponent {
 *   items = [
 *     { key: 'item1' },
 *     { key: 'item2' },
 *     { key: 'item3' }
 *   ];
 *   selected: any;
 *   isLoading = false;
 *
 *   onSelect(item: any) {
 *     this.selected = item;
 *     console.log('Selected item:', item);
 *   }
 *
 *   onAddItem(newItem: any) {
 *     this.items.push(newItem);
 *     console.log('Added item:', newItem);
 *   }
 *
 *   onDeleteItem(item: any) {
 *     this.items = this.items.filter(i => i.key !== item.key);
 *     console.log('Deleted item:', item);
 *   }
 *
 *   fetchItems() {
 *     console.log('Refreshing items...');
 *   }
 * }
 * ```
 */
@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.component.html',
  styleUrls: ['./generic-list.component.scss']
})
export class GenericListComponent<T extends { key: string }> {
    /**
     * List of items displayed in the component.
     * Each item must have a `key: string` property.
     */
    @Input() itemList: T[] = [];

    /**
     * Currently selected item (optional).
     */
    @Input() selectedItem: T | undefined;

    /**
     * Icon displayed next to each item (e.g., `'folder'`, `'category'`).
     */
    @Input() icon = 'category';

    /**
     * Enables or disables the loading indicator.
     */
    @Input() loading = false;

    /**
     * Event emitted when an item is selected.
     */
    @Output() select = new EventEmitter<T>();

    /**
     * Event emitted when a new item is added.
     */
    @Output() addItem = new EventEmitter<T>();

    /**
     * Event emitted when an item is deleted.
     */
    @Output() deleteItem = new EventEmitter<T>();

    /**
     * Event emitted when the list is refreshed.
     */
    @Output() onrefresh = new EventEmitter<void>();

    /**
     * Search filter control for filtering the item list.
     */
    filterControl = new FormControl('');

    /**
     * Stores the name of the new item to be added.
     */
    newItemName: string = '';

    /**
     * Selects an item and emits a `select` event.
     * @param item The selected item.
     */
    onClickItem(item: T): void {
        this.select.emit(item);
    }

    /**
     * Triggers a refresh event by emitting `onrefresh`.
     */
    refresh(): void {
        this.onrefresh.emit();
    }

    /**
     * Adds a new item to the list.
     * - If `newItemName` is empty, a unique name like `default_1`, `default_2`, etc., is generated.
     * - Checks if an item with the same name already exists.
     * - Emits `addItem` with the created item.
     */
    onAddItem(): void {
        let itemName = this.newItemName.trim();

        if (!itemName) {
            const baseName = 'default_';
            let index = 1;
            while (this.itemList.some(item => item.key === `${baseName}${index}`)) {
                index++;
            }
            itemName = `${baseName}${index}`;
        } else {
            if (this.itemList.some(item => item.key === itemName)) {
                alert("An item with this name already exists!");
                return;
            }
        }

        const newItem = { key: itemName } as T;
        this.addItem.emit(newItem);
        this.newItemName = '';
    }

    /**
     * Returns a filtered list based on the search input.
     * @returns List of items matching the search criteria.
     */
    get filteredList(): T[] {
        const filterValue = (this.filterControl.value || '').toLowerCase();
        return this.itemList.filter(item =>
            item.key.toLowerCase().includes(filterValue)
        );
    }

    /**
     * Deletes an item from the list and emits `deleteItem`.
     * @param item The item to be removed.
     */
    onDeleteItem(item: any): void {
        this.itemList = this.itemList.filter(i => i.key !== item.key);
        this.deleteItem.emit(item);
    }
}
