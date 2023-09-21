import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { ViewItem } from '../../_objects/View';

@Directive({
  selector: '[appDraginfo]'
})
export class DraginfoDirective {

  @Output() appDraginfo = new EventEmitter<boolean>()

  constructor() { }

  @HostListener('dragstart', ['$event'])
  onDragStart(evt:any) {
    this.appDraginfo.emit(true)
  }

  /*
  @HostListener('dragenter', ['$event'])
  onDragEnter(evt:any) {
    this.appDraginfo.emit(true)
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt:any) {
    this.appDraginfo.emit(true)
  }
  */

  @HostListener('mouseup')
  mouseUp(){
    this.appDraginfo.emit(false)
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(evt:any) {
    this.appDraginfo.emit(false)
  }
}
