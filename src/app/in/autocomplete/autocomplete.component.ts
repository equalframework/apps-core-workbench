import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {

    @Input() name:string = ""
    @Input() values:string[] = []
    @Input() value:string = ""
    @Input() width:string = "auto"
    @Input() disabled:boolean = false

    @Output() valueChange = new EventEmitter<string>()

    public f_values:string[]

    public valueControl = new FormControl("")

    constructor() { }

    ngOnInit(): void {
        this.valueControl.valueChanges.subscribe( (value) =>  {
                this.f_values = this.values.filter((item:string) => item.toLowerCase().includes(value.toLowerCase()));
                this.checkvalue();
            }
        );
    }

    ngOnChanges() {
        this.reset()
        if(this.disabled) {
            this.valueControl.disable({emitEvent:false});
        }
    }

    public checkvalue() {
        if(this.values.includes(this.valueControl.value) && (this.value !== this.valueControl.value)) {
            this.valueChange.emit(this.valueControl.value);
        }
    }

    public resetEntry() {
        this.valueControl.setValue(this.value,{emitEvent:false})
    }

    public noCancel(event: KeyboardEvent) {
        if( event.key === "z" && event.ctrlKey) {
            event.preventDefault()
            event.stopImmediatePropagation()
        }
        if( event.key === "y" && event.ctrlKey) {
            event.preventDefault()
            event.stopImmediatePropagation()
        }
    }

    public reset() {
        this.valueControl.setValue(this.value,{emitEvent:false});
        this.f_values = this.values.filter((item:string) => item.toLowerCase().includes(this.valueControl.value.toLowerCase()));
    }

}
