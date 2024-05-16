import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Node } from '../../_objects/Node';

@Component({
  selector: 'app-pipeline-node',
  templateUrl: './pipeline-node.component.html',
  styleUrls: ['./pipeline-node.component.scss']
})
export class PipelineNodeComponent {
  @Input() node: Node;

  @Input() state: string;

  @Output() editNode = new EventEmitter<Node>();

  @Output() deleteNode = new EventEmitter<Node>();

  @Output() from = new EventEmitter<Node>();

  @Output() to = new EventEmitter<Node>();

  edit() {
    this.editNode.emit(this.node);
  }

  delete() {
    this.deleteNode.emit(this.node);
  }

  linkFrom() {
    this.from.emit(this.node);
  }

  linkTo() {
    this.to.emit(this.node);
  }
}
