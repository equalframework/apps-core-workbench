import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MenuItem } from '../../_object/Menu';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class ItemEditorComponent implements OnInit {

  @Input() item:MenuItem = new MenuItem()
  @Input() selected_item:MenuItem|undefined = undefined

  @Output() select = new EventEmitter<MenuItem>()
  @Output() CRUD = new EventEmitter<void>()
  @Output() deleteMe = new EventEmitter<void>()

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log(this.selected_item)
  }

  addChild() {
    this.item.children.push(new MenuItem)
    this.CRUD.emit()
  }

  ondelete() {
    this.deleteMe.emit()
  }

  deleteChild(index:number) {
    this.item.children.splice(index,1)
  }


  drop(event: CdkDragDrop<MenuItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

}
