import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { ViewItem } from '../../_objects/View';

@Directive({
  selector: '[appDraginfo]'
})
export class DraginfoDirective {

  @Output() appDraginfo = new EventEmitter<number>()

  constructor() { }

  @HostListener('dragstart', ['$event'])
  onDragStart(evt:any) {
    this.appDraginfo.emit(1)
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(evt:any) {
    this.appDraginfo.emit(2)
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt:any) {
    this.appDraginfo.emit(2)
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(evt:any) {
    this.appDraginfo.emit(3)
  }
}
