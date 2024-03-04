import { Component } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ControllerNode } from './_objects/ControllerNode';
import { ControllerData } from './_objects/ControllerData';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {

  public state: string = 'view';

  public nodes: ControllerNode[] = [];

  public view_offset: { x: number, y: number } = { x: 0, y: 0 };

  constructor(
    private router: RouterMemory,
    private api: ApiService
  ) { }

  public goBack() {
    this.router.goBack()
  }

  public load() { }

  public newFile() { }

  public save() { }

  public reset() { }

  public setState(newState: string) {
    this.state = newState;
  }

  get sizeViewer(): number {
    switch (this.state) {
      case "view":
        return 12;
      default:
        return 8;
    }
  }

  get sizeEditor(): number {
    switch (this.state) {
      case "view":
        return 0;
      default:
        return 4;
    }
  }

  async addNode(value: ControllerData) {
    const info = (await this.api.fetch(value.url + '&announce=true')).announcement;
    const node: ControllerNode = new ControllerNode(value, info.description, info.params, info.response, info.access, info.providers, { x: -this.view_offset.x + 100, y: -this.view_offset.y + 100 });
    this.nodes.push(node);
  }
}