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
  @Output() select = new EventEmitter<T>();
  @Output() addItem = new EventEmitter<void>();

  filterControl = new FormControl('');

  onClickItem(item: T): void {
    this.select.emit(item);
  }

  onAddItem(): void {
    this.addItem.emit();
  }
  get filteredList(): T[] {
    const filterValue = (this.filterControl.value || '').toLowerCase();
    return this.itemList.filter(item =>
      item.key.toLowerCase().includes(filterValue)
    );
  }
}
