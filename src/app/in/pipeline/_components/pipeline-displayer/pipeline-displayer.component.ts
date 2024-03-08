import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControllerNode } from '../../_objects/ControllerNode';
import { cloneDeep } from 'lodash';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { ControllerLink } from '../../_objects/ControllerLink';

@Component({
  selector: 'app-pipeline-displayer',
  templateUrl: './pipeline-displayer.component.html',
  styleUrls: ['./pipeline-displayer.component.scss']
})
export class PipelineDisplayerComponent {
  public isGrabbed: boolean = false;

  @Input() view_offset: { x: number, y: number };

  public mouse_pos: { x: number, y: number } = { x: 0, y: 0 };

  @Input() nodes: ControllerNode[];

  @Input() state: string;

  @Output() deleteNode = new EventEmitter<number>();

  @Output() editNode = new EventEmitter<number>();

  public indexFrom: number = -1;

  @Output() addLink = new EventEmitter<{ indexFrom: number, indexTo: number }>();

  @Input() links: ControllerLink[];

  get backgroundPos() {
    return `top ${this.view_offset.y}px left ${this.view_offset.x}px`;
  }

  moveBackground(mouse: MouseEvent) {
    let old_mouse_pos = cloneDeep(this.mouse_pos);
    this.mouse_pos.x = mouse.clientX;
    this.mouse_pos.y = mouse.clientY;
    if (this.isGrabbed) {
      this.view_offset.x += (this.mouse_pos.x - old_mouse_pos.x);
      this.view_offset.y += (this.mouse_pos.y - old_mouse_pos.y);
    }
  }

  deleteN(index: number) {
    this.deleteNode.emit(index);
  }

  editN(index: number) {
    this.editNode.emit(index);
  }

  linkFrom(index: number) {
    this.indexFrom = index;
  }

  linkTo(index: number) {
    if (this.indexFrom !== -1 && this.indexFrom !== index) {
      this.addLink.emit({ indexFrom: this.indexFrom, indexTo: index });
      this.indexFrom = -1;
    }
  }

  onDragEnd(node: ControllerNode, event: CdkDragEnd) {
    node.updatedPosition.x += event.distance.x;
    node.updatedPosition.y += event.distance.y;
  }
}