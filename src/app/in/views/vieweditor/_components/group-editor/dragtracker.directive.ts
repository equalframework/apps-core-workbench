import { Directive, HostListener, Input } from '@angular/core';
import { ViewItem } from '../../_objects/View';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Directive({selector: '[appDragtracker]'})
export class DragTrackerDirective {

  @Input() appDragtracker:{
    data_ref:ViewItem[],
    ref:ViewItem,
    before:boolean,
    dragged:ViewItem|undefined,
    dragged_list:ViewItem[]|undefined
  }

  @HostListener('dragover', ['$event'])
  onDragOver(evt:any) {
    if(this.appDragtracker.dragged && this.appDragtracker.dragged_list) {
      let x = this.appDragtracker.data_ref.indexOf(this.appDragtracker.ref)
      let y = this.appDragtracker.dragged_list.indexOf(this.appDragtracker.dragged)
      console.log({x:x,y:y})
      if(x >= 0 && y >= 0) {
        let index = this.appDragtracker.before ? x : x+1
        //if(index >= this.appDragtracker.data_ref.length) index = this.appDragtracker.data_ref.length-1
        if(this.appDragtracker.data_ref === this.appDragtracker.dragged_list) {
          moveItemInArray(
            this.appDragtracker.data_ref,
            y, 
            index
          );
        } else {
          transferArrayItem(
            this.appDragtracker.dragged_list,
            this.appDragtracker.data_ref,
            y,
            index
          );
        }
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(evt:any) {
    console.warn("DROP !");
  }
}