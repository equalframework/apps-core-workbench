import { Directive, HostListener, Input } from '@angular/core';
import { ViewItem, ViewSection } from '../../_objects/View';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { before } from 'lodash';

@Directive({selector: '[appDragtracker]'})
export class DragTrackerDirective {

  @Input() appDragtracker:{
    data_ref:ViewItem[],
    ref:ViewItem|undefined,
    before:boolean,
    dragged:ViewItem|undefined,
    obj:ViewSection;
  }

  @HostListener('dragover', ['$event'])
  onDragOver(evt:any) {
    console.log("DRAGGED ON | before : "+this.appDragtracker.before)
    let dg = this.draggedlist
    if(this.appDragtracker.dragged && dg) {
      let y = dg.indexOf(this.appDragtracker.dragged)

      if(this.appDragtracker.data_ref.length === 0 && this.appDragtracker.ref === undefined) {
        let y = dg.indexOf(this.appDragtracker.dragged)
        if(this.appDragtracker.data_ref === dg) {
          moveItemInArray(
            this.appDragtracker.data_ref,
            y, 
            0
          );
        } else {
          transferArrayItem(
            dg,
            this.appDragtracker.data_ref,
            y,
            0
          );
        }
        return
      }
      if(this.appDragtracker.ref) {
        let x = this.appDragtracker.data_ref.indexOf(this.appDragtracker.ref)
        if(x >= 0 && y >= 0) {
          let index = this.appDragtracker.before ? x : x+1
          //if(index >= this.appDragtracker.data_ref.length) index = this.appDragtracker.data_ref.length-1
          if(this.appDragtracker.data_ref === dg) {
            moveItemInArray(
              this.appDragtracker.data_ref,
              y, 
              index
            );
          } else {
            transferArrayItem(
              dg,
              this.appDragtracker.data_ref,
              y,
              index
            );
          }
        }
      }
    }
  }

  get draggedlist():ViewItem[]|undefined {
    if(this.appDragtracker.dragged){
      for(let row of this.appDragtracker.obj.rows) {
        for(let column of row.columns) {
          if(column.items.indexOf(this.appDragtracker.dragged) >= 0) return column.items
        }
      }
    }
    return undefined
  }

  @HostListener('drop', ['$event'])
  onDrop(evt:any) {
    console.warn("DROP !");
  }
}