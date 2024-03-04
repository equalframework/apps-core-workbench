import { Component, Input } from '@angular/core';
import { ControllerNode } from '../../_objects/ControllerNode';
import { cloneDeep } from 'lodash';

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
}