import { Directive, HostListener, Input } from '@angular/core';
import { ViewItem, ViewSection } from '../../_objects/View';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { before } from 'lodash';

@Directive({selector: '[appDragTracker]'})
export class DragTrackerDirective {

  @Input() appDragTracker: {
    dataRef: ViewItem[],
    ref: ViewItem|undefined,
    before: boolean,
    dragged: ViewItem|undefined,
    obj: ViewSection;
  };

  @HostListener('dragover', ['$event'])
  onDragOver(evt: any): void {
    const dg = this.draggedList;
    if (this.appDragTracker.dragged && dg) {
      const y = dg.indexOf(this.appDragTracker.dragged);

      if (this.appDragTracker.dataRef.length === 0 && this.appDragTracker.ref === undefined) {
        const y = dg.indexOf(this.appDragTracker.dragged);
        if (this.appDragTracker.dataRef === dg) {
          moveItemInArray(
            this.appDragTracker.dataRef,
            y,
            0
          );
        } else {
          transferArrayItem(
            dg,
            this.appDragTracker.dataRef,
            y,
            0
          );
        }
        return;
      }
      if (this.appDragTracker.ref) {
        const x = this.appDragTracker.dataRef.indexOf(this.appDragTracker.ref);
        if (x >= 0 && y >= 0) {
          const index = this.appDragTracker.before ? x : x + 1;
          // if(index >= this.appDragTracker.dataRef.length) index = this.appDragTracker.dataRef.length-1
          if (this.appDragTracker.dataRef === dg) {
            moveItemInArray(
              this.appDragTracker.dataRef,
              y,
              index
            );
          } else {
            transferArrayItem(
              dg,
              this.appDragTracker.dataRef,
              y,
              index
            );
          }
        }
      }
    }
  }

  get draggedList(): ViewItem[]|undefined {
    if (this.appDragTracker.dragged){
      for (const row of this.appDragTracker.obj.rows) {
        for (const column of row.columns) {
          if (column.items.indexOf(this.appDragTracker.dragged) >= 0) { return column.items; }
        }
      }
    }
    return undefined;
  }

  @HostListener('drop', ['$event'])
  onDrop(evt: any): void {
    console.warn('DROP !');
  }
}
