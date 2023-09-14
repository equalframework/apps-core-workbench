import { ViewEncapsulation } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-model-info',
  templateUrl: './model-info.component.html',
  styleUrls: ['./model-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModelInfoComponent implements OnInit {
  @Input() selected_package:string
  @Input() selected_class:string
  @Input() class_scheme:any
  @Output() changeStep = new EventEmitter<number>()

  public obk = Object.keys

  constructor() { }

  ngOnInit(): void {
  }

  ngOnUpdate() {
  }

  fieldOnClick() {
    this.changeStep.emit(2);
  }
}
