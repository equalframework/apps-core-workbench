import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { ViewItem } from '../../_objects/View';

@Directive({
  selector: '[appDraginfo]'
})
export class DraginfoDirective {

  @Output() appDraginfo = new EventEmitter<void>()

  constructor() { }

  @HostListener("stopdrag")
  StopDrag() {
    this.appDraginfo.emit()
  }
}
