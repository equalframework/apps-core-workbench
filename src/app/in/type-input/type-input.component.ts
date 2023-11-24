import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { emit } from 'process';
import { FieldClass } from '../models/_object/FieldClass';

@Component({
  selector: 'app-type-input',
  templateUrl: './type-input.component.html',
  styleUrls: ['./type-input.component.scss']
})
export class TypeInputComponent implements OnInit,OnChanges {

  @Input() type:string = 'string'
  @Input() usage:string = ''
  @Input() value:any = undefined
  @Input() name:string = ""
  @Input() disabled:boolean = false

  @Output() changed = new EventEmitter<any>();

  JsonControl= new FormControl("", {
    validators : [json_case]
  })

  constructor() { }

  ngOnInit(): void {
    
  }

  ngOnChanges() {
    this.JsonControl.setValue(JSON.stringify(this.value,null, 2))
  }

  public changeDefaultFromJson() {
    if(this.JsonControl.valid) {
      this.changed.emit(JSON.parse(this.JsonControl.value))
    }
  }

  public changeDefaultDate(value:string) {
    let d = new Date(value)
    console.log("getting : "+d.toISOString())
    console.log(d.getTimezoneOffset())
    //d.setHours(d.getHours(),d.getMinutes()+d.getTimezoneOffset(),d.getSeconds(),0)
    this.changed.emit(d.getTime()/1000)
    console.log("emitting : "+d.toISOString())
  }

  noCancel(event: KeyboardEvent) {
    console.log(event)
    if( event.key === "z" && event.ctrlKey) {
      event.preventDefault()
    }
    if( event.key === "y" && event.ctrlKey) {
      event.preventDefault()
    }
  } 

  get defaultAsDateTimeLocal() {
    try {
      let d = new Date(this.value)
      d.setHours(d.getHours(),d.getMinutes()-d.getTimezoneOffset(),d.getSeconds(),0)
      let x:string = d.toISOString()
      
      return x.split(":",2).join(":")
    } catch {
      return ""
    }
    
  }

  TabBehavior(event:any) {
    event.preventDefault()
    let caret = event.target.selectionStart
    console.log("caret @ "+caret)
    let x:string[] = this.JsonControl.value.split('')
    console.log(x)
    x.splice(caret,event.target.selectionEnd-caret,"  ")
    console.log(x)
    this.JsonControl.setValue(
      x.join('')
    )
    event.target.selectionStart = caret + 2 
    event.target.selectionEnd = caret + 2 
  } 

  get cannotBeDisplayed() {
    return this.type !== "string" && this.type !== 'integer' && this.type !== 'float' && this.type !== 'array' && this.type !== 'date'
      && this.type !== 'datetime' && this.type !== 'time' && this.type !== 'boolean' && this.type !== "many2many" &&  this.type !== "one2many"
      &&  this.type !== "many2one"
  }

}

function json_case(control: AbstractControl): ValidationErrors | null {
  let value: string = control.value
  try {
    JSON.parse(value)
    return null
  } catch {
    return { "case": true }
  }
}