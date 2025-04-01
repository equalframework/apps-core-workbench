import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.component.html',
  styleUrls: ['./generic-list.component.scss']
})
export class GenericListComponent<T extends { key: string }> {
    @Input() itemList: T[] = [];
    @Input() selectedItem: T | undefined;
    @Input() icon = 'category';
    @Input() loading = false;

    @Output() select = new EventEmitter<T>();
    @Output() addItem = new EventEmitter<T>();
    @Output() deleteItem = new EventEmitter<T>();
    @Output() onrefresh = new EventEmitter<void>();

  filterControl = new FormControl('');
  newItemName: string = '';

  onClickItem(item: T): void {
    this.select.emit(item);
  }

  refresh(): void {
      this.onrefresh.emit();
  }
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

  get filteredList(): T[] {
    const filterValue = (this.filterControl.value || '').toLowerCase();
    return this.itemList.filter(item =>
      item.key.toLowerCase().includes(filterValue)
    );
  }
  onDeleteItem(item: any) {
    this.itemList = this.itemList.filter(i => i.key !== item.key);
    this.deleteItem.emit(item);
  }

}
