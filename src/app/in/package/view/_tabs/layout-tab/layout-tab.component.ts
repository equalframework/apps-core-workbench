import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { View, ViewGroup, ViewItem, ViewSection } from '../../_objects/View';

@Component({
  selector: 'app-layout-tab',
  templateUrl: './layout-tab.component.html',
  styleUrls: ['./layout-tab.component.scss']
})
export class LayoutTabComponent implements OnInit {
  @Input() viewObj: View;
  @Input() entity: string;
  @Input() fields: string[] = [];
  @Input() groups: string[] = [];
  @Input() action_controllers: string[] = [];
  @Input() class_scheme: any = {fields : {}};
  @Input() iconType: { [id: string]: string };


  @Output() viewObjChange = new EventEmitter<View>();

  @ViewChild('layoutTabContainer', { read: ElementRef }) layoutTabContainer: ElementRef;

  types = ViewItem.typeList;
  private tabComponentId = 'layout';

  constructor() {}

  ngOnInit(): void {
    // Initialization
  }

  addGroup() {
    this.viewObj.layout.groups.push(new ViewGroup({ label: 'New Group' }));
    this.viewObjChange.emit(this.viewObj);
  }

  deleteGroup(index: number) {
    this.viewObj.layout.groups.splice(index, 1);
    this.viewObjChange.emit(this.viewObj);
  }

  addItemLayout() {
    this.viewObj.layout.newViewItem();
    this.viewObjChange.emit(this.viewObj);
  }

  deleteItemLayout(index: number) {
    this.viewObj.layout.deleteItem(index);
    this.viewObjChange.emit(this.viewObj);
  }

  drop_item(event: CdkDragDrop<ViewItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.viewObjChange.emit(this.viewObj);
  }
}
