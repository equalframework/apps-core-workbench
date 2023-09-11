import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-model-info',
  templateUrl: './model-info.component.html',
  styleUrls: ['./model-info.component.scss']
})
export class ModelInfoComponent implements OnInit {
  @Input() selected_package:string
  @Input() selected_class:string
  @Output() changeStep = new EventEmitter<number>()

  constructor() { }

  ngOnInit(): void {
  }

  ngOnUpdate() {
    console.log(this.selected_class)
  }

  fieldOnClick() {
    this.changeStep.emit(2);
  }

}
