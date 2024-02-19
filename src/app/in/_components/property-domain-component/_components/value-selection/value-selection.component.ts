import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

export const _filter = (opt: string[], value: string): string[] => {
    const filterValue = value.toLowerCase();
    return opt.filter(item => item.toLowerCase().includes(filterValue));
};
@Component({
    selector: 'app-value-selection',
    templateUrl: './value-selection.component.html',
    styleUrls: ['./value-selection.component.scss']
})
export class ValueSelectionComponent implements OnInit {

    @Input() operand: any;
    @Input() type: any;
    @Input() value: any;
    @Input() operator: any;
    @Input() fields: any;
    @Output() changeValue = new EventEmitter<any>();

    public myControl = new FormControl('');

    constructor() { }

    ngOnInit(): void {
        console.log(this.fields.fields[this.operand])
        this.myControl.setValue(this.value);
    }

    ngOnChanges() {
    }

    public containsOption(option: any) {
        return this.value.includes(option);
    }

    public changeOption(option: any) {
        console.log(option);
        this.changeValue.emit(option);
    }

    public onOptionChange(event: any) {
        console.log(event.value);
        this.changeValue.emit(event.value);
    }

    get options() {
        if (! (typeof this.fields.fields['operand'] === "object")) {
            return this.fields.fields[this.operand].selection
        } else {
            return Object.keys(this.fields.fields[this.operand].selection)
        }
    }
}
