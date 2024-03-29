import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Node } from '../../_objects/Node';
import { cloneDeep } from 'lodash';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { NodeLink } from '../../_objects/NodeLink';

@Component({
  selector: 'app-pipeline-displayer',
  templateUrl: './pipeline-displayer.component.html',
  styleUrls: ['./pipeline-displayer.component.scss']
})
export class PipelineDisplayerComponent {
  public isGrabbed: boolean = false;

  @Input() view_offset: { x: number, y: number };

  public mouse_pos: { x: number, y: number } = { x: 0, y: 0 };

  @Output() changeState = new EventEmitter<string>();

  @Input() nodes: Node[];

  @Input() state: string;

  @Output() deleteNode = new EventEmitter<Node>();

  private isClick: boolean = true;

  @Output() editNode = new EventEmitter<Node>();

  public nodeFrom: Node | undefined;

  @Output() addLink = new EventEmitter<{ nodeFrom: Node, nodeTo: Node }>();

  @Input() links: NodeLink[];

  @Output() editLink = new EventEmitter<NodeLink>();

  @Output() deleteLink = new EventEmitter<NodeLink>();

  change(state: string) {
    this.changeState.emit(state);
  }

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

  onDragStart() {
    this.isClick = false;
  }

  onDragEnd(node: Node, event: CdkDragEnd) {
    const deltaX = event.distance.x;
    const deltaY = event.distance.y;
    node.updatedPosition.x += deltaX;
    node.updatedPosition.y += deltaY;
  }

  editN(node: Node) {
    if (this.isClick) {
      this.editNode.emit(node);
    }
    this.isClick = true;
  }

  deleteN(node: Node) {
    this.deleteNode.emit(node);
  }

  linkFrom(node: Node) {
    this.nodeFrom = node;
  }

  linkTo(node: Node) {
    if (this.nodeFrom !== undefined && this.nodeFrom !== node) {
      this.addLink.emit({ nodeFrom: this.nodeFrom, nodeTo: node });
      this.nodeFrom = undefined;
    }
  }

  editL(link: NodeLink) {
    this.editLink.emit(link);
  }

  deleteL(link: NodeLink) {
    this.deleteLink.emit(link);
  }
}