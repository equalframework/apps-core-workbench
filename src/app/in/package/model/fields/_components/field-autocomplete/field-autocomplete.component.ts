import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-field-autocomplete',
  templateUrl: './field-autocomplete.component.html',
  styleUrls: ['./field-autocomplete.component.scss']
})
export class FieldAutocompleteComponent implements OnInit {

  @Input() name = '';
  @Input() values: string[] = [];
  @Input() value = '';
  @Input() width = 'auto';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  fValues: string[];

  valueControl = new FormControl('');

  constructor() { }

  ngOnInit(): void {
    this.valueControl.valueChanges.subscribe(
      value =>  {
        this.fValues = this.values.filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
        this.checkValue();
      }
    );
  }

  ngOnChanges(): void {
    this.reset();
    if (this.disabled) {
      this.valueControl.disable({emitEvent: false});
    }
  }

  checkValue(): void {
    if (this.values.includes(this.valueControl.value) && (this.value !== this.valueControl.value)) {
      this.valueChange.emit(this.valueControl.value);
    }
  }

  resetEntry(): void {
    this.valueControl.setValue(this.value, {emitEvent: false});
  }

  noCancel(event: KeyboardEvent): void {
    if ( event.key === 'z' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if ( event.key === 'y' && event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  reset(): void {
    this.valueControl.setValue(this.value, {emitEvent: false});
    this.fValues = this.values.filter((item: string) => item.toLowerCase().includes(this.valueControl.value.toLowerCase()));
  }

}
