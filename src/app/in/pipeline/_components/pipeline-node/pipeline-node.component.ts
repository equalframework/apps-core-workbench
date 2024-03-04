import { Component, Input } from '@angular/core';
import { ControllerNode } from '../../_objects/ControllerNode';

@Component({
  selector: 'app-pipeline-node',
  templateUrl: './pipeline-node.component.html',
  styleUrls: ['./pipeline-node.component.scss']
})
export class PipelineNodeComponent {
  @Input() node: ControllerNode;
}
