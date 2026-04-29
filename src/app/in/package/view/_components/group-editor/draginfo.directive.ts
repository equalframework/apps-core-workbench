import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { ViewItem } from '../../_objects/View';

@Directive({
  selector: '[appDragInfo]'
})
export class DragInfoDirective {

  @Output() appDragInfo = new EventEmitter<void>();

  constructor() { }

  @HostListener('stopDrag')
  StopDrag(): void {
    this.appDragInfo.emit();
  }
}
