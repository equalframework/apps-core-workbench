import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-item-display',
  templateUrl: './item-display.component.html',
  styleUrls: ['./item-display.component.scss']
})
export class ItemDisplayComponent {
    @Input() value: string = '';
    @Input() icon: string = 'info';
    @Input() tooltip: string = '';
    @Input() editable: boolean = true;
    @Input() deletable: boolean = true;

    @Output() delete = new EventEmitter<void>();
    @Output() itemClick = new EventEmitter<void>();

    isEditing: boolean = false;
    editedValue: string = '';

    startEdit() {
        if (!this.editable) return;
        this.isEditing = true;
        this.editedValue = this.value;
    }

    saveEdit() {
        this.value = this.editedValue;
        this.isEditing = false;
    }

    cancelEdit() {
        this.isEditing = false;
    }

    onDelete(event: Event) {
        event.stopPropagation();
        this.delete.emit();
    }

    onClickItem() {
    this.itemClick.emit();
    }
}
