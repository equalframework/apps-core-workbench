import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-checkbox-list',
  templateUrl: './checkbox-list.component.html',
  styleUrls: ['./checkbox-list.component.scss']
})
export class CheckboxListComponent implements OnChanges {
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() selectedValues: any[] = [];
  @Input() displayWith: (value: any) => string = (value) => value;

  @Output() selectionChange = new EventEmitter<any[]>();

  internalSelectedValues: Set<any> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedValues) {
      console.log("🔍 selectedValues reçu :", this.selectedValues);
      this.internalSelectedValues = new Set(this.selectedValues || []);
    }
    if (changes.options) {
      console.log("🔍 options disponibles :", this.options);
    }
    console.log("🔍 displayWith", this.displayWith(this.selectedValues[0]))
  }


  toggleSelection(value: any) {
    if (this.internalSelectedValues.has(value)) {
      this.internalSelectedValues.delete(value);
    } else {
      this.internalSelectedValues.add(value);
    }
    this.selectionChange.emit([...this.internalSelectedValues]);
  }
}
