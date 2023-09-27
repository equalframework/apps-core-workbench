import { ViewEncapsulation } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-model-info',
  templateUrl: './model-info.component.html',
  styleUrls: ['./model-info.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ModelInfoComponent implements OnInit {
  @Input() selected_package:string
  @Input() selected_class:string
  @Input() class_scheme:any
  @Output() changeStep = new EventEmitter<number>()

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

  fieldHasProp(key:string):boolean {
    return this.class_scheme['fields'][key]['required'] 
      || this.class_scheme['fields'][key]['readonly']
      || this.class_scheme['fields'][key]['multilang']
      || this.class_scheme['fields'][key]['unique']
  }

  get fieldNumber():number {
    return this.obk(this.class_scheme['fields']).length
  }
}