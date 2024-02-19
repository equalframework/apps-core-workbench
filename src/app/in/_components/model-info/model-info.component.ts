import { ViewEncapsulation } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-model-info',
  templateUrl: './model-info.component.html',
  styleUrls: ['./model-info.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})

/**
 * @description
 * Component used to display information about a model aside with a list of model
 */
export class ModelInfoComponent implements OnInit {
  @Input() selected_package:string
  @Input() selected_class:string
  @Input() class_scheme:any
  @Output() changeStep = new EventEmitter<number>()
  @Output() getRef = new EventEmitter<{package?:string,name:string,type:string,more?:any}>()

  public iconList: { [id: string]: string } = {
    "string": "format_quote",
    "integer": "123",
    "array": "data_array",
    "float": "money",
    "boolean": "question_mark",
    "computed": "functions",
    "alias": "type_specimen",
    "binary": "looks_one",
    "date": "today",
    "datetime": "event",
    "time": "access_time",
    "text": "article",
    "many2one": "call_merge",
    "one2many": "call_split",
    "many2many": "height"
  }

  public obk = Object.keys
  good_field:any

  constructor() { }

  ngOnInit(): void {
  }

  ngOnUpdate() {
    this.good_field = {}
      for(let key in this.class_scheme['fields']) {
        if( key !== "deleted" && key !== "id" && key !== "state") {
          this.good_field[key] = this.class_scheme['fields'][key]
        }
      }
  }

  fieldOnClick() {
    this.changeStep.emit(2);
  }

  viewOnClick() {
    this.changeStep.emit(3);
  }

  tradOnClick() {
    this.changeStep.emit(4)
  }

  workflowOnClick() {
    this.changeStep.emit(5)
  }

  /**
   * @description
   * Looks for properties about a field of the model
   * @param key name of the field
   * @returns true if this field has at least one propertie, false else
   */
  fieldHasProp(key:string):boolean {
    return this.class_scheme['fields'][key]['required'] 
      || this.class_scheme['fields'][key]['readonly']
      || this.class_scheme['fields'][key]['multilang']
      || this.class_scheme['fields'][key]['unique']
  }

  /**
   *  @description
   *  Simple Getter of the number of field
   * @returns field list length
   */
  get fieldNumber():number {
    return this.obk(this.class_scheme['fields']).length
  }

  getref(name:string) {
    let x = name.split('\\')
    this.getRef.emit({package:x[0],name:x.slice(1).join('\\'),type:'class'})
  }
}