import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'autocomplete-multi',
  templateUrl: './autocomplete-multi.component.html',
  styleUrls: ['./autocomplete-multi.component.scss']
})
export class AutocompleteMultiComponent implements OnInit {

  obk = Object.keys

  @Input() name:string = ""
  @Input() values:{[id:string]:string[]}= {}
  @Input() value:string = ""
  @Input() width:string = "auto"
  @Input() disabled:boolean = false

  @Output() valueChange = new EventEmitter<string>()

  f_values:{[id:string]:string[]} = {}

  valueControl = new FormControl("")

  constructor() { }

  ngOnInit(): void {
    this.valueControl.valueChanges.subscribe(
      value =>  {
        this.f_values = {}
        for(let key in this.values){
          this.f_values[key] = []
          this.f_values[key] = this.values[key].filter((item:string) => item.toLowerCase().includes(value.toLowerCase()))
        }
        this.checkvalue()
      }
    )
  }

  ngOnChanges() {
    this.reset()
    if(this.disabled)
      this.valueControl.disable({emitEvent:false})
  }

  checkvalue() {
    console.log("checked")
    for(let key in this.values) {
      if(this.values[key].includes(this.valueControl.value) && (this.value !== this.valueControl.value)) {
        this.valueChange.emit(this.valueControl.value)
        return
      }
    }
  }

  resetEntry() {
    this.valueControl.setValue(this.value,{emitEvent:false})
  }

  noCancel(event: KeyboardEvent) {
    console.log(event)
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  } 

  reset() {
    this.valueControl.setValue(this.value,{emitEvent:false})
    for(let key in this.values){
      this.f_values[key] = []
      this.f_values[key] = this.values[key].filter((item:string) => item.toLowerCase().includes(this.value.toLowerCase()))
    }
  }

}
