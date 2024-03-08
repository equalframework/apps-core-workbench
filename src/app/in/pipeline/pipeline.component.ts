import { Component } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ControllerNode } from './_objects/ControllerNode';
import { ControllerData } from './_objects/ControllerData';
import { ApiService } from 'sb-shared-lib';
import { splitAtColon } from '@angular/compiler/src/util';
import { ControllerLink } from './_objects/ControllerLink';
import { forEach } from 'lodash';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {

  public state: string = 'view';

  public nodes: ControllerNode[] = [];

  public view_offset: { x: number, y: number } = { x: 0, y: 0 };

  public selectedNode: ControllerNode | undefined;

  public indexNode: number;

  public links: ControllerLink[] = [];

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

  get sizeViewer(): number {
    if (this.state === "add-controller" || this.state === "edit-controller") {
      return 8;
    }
    return 12;
  }

  get sizeEditor(): number {
    if (this.state === "add-controller" || this.state === "edit-controller") {
      return 4;
    }
    return 0;
  }

  async addNode(value: ControllerData) {
    const info = (await this.api.fetch(value.url + '&announce=true')).announcement;
    value.description = info.description;
    value.params = info.params;
    value.response = info.response;
    value.access = info.access;
    value.providers = info.providers;
    const node: ControllerNode = new ControllerNode(value, { x: -this.view_offset.x + 100, y: -this.view_offset.y + 100 });
    this.nodes.push(node);
  }

  deleteNode(index: number) {
    const deletedNode = this.nodes[index];

    let new_links = [];
    for (let link of this.links) {
      if (link.from === deletedNode || link.to === deletedNode) {
        continue;
      }
      new_links.push(link);
    }
    this.links = new_links;

    this.nodes.splice(index, 1);

    if (index === this.indexNode) {
      this.selectedNode = undefined;
    }

  }

  editNode(index: number) {
    this.indexNode = index;
    this.selectedNode = this.nodes[index];
  }

  addLink(value: { indexFrom: number, indexTo: number }) {
    const nodeFrom = this.nodes[value.indexFrom];
    const nodeTo = this.nodes[value.indexTo];

    for (let link of this.links) {
      if ((link.from === nodeFrom && link.to === nodeTo) || (link.from === nodeTo && link.to === nodeFrom)) {
        return;
      }
    }

    const link = new ControllerLink(nodeFrom, nodeTo);
    this.links.push(link);
  }
}