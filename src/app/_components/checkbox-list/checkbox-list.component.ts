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
      const previous = changes.selectedValues.previousValue || [];
      const current = changes.selectedValues.currentValue || [];
      if (!this.areArraysEqual(previous, current)) {
        console.log("🔍 selectedValues modifié :", current);
        this.internalSelectedValues = new Set(current);
      }
    }
  }

  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((value, index) => value === sorted2[index]);
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
