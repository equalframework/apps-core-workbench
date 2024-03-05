import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControllerNode } from '../../_objects/ControllerNode';

@Component({
  selector: 'app-pipeline-node',
  templateUrl: './pipeline-node.component.html',
  styleUrls: ['./pipeline-node.component.scss']
})
export class PipelineNodeComponent {
  @Input() node: ControllerNode;

  @Input() index: number;

  @Input() state: string;

  @Output() deleteNode = new EventEmitter<number>();

  @Output() editNode = new EventEmitter<number>();

  delete() {
    this.deleteNode.emit(this.index);
  }

  edit() {
    this.editNode.emit(this.index);
  }
}
