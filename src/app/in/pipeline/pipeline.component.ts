import { Component } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Node } from './_objects/Node';
import { ControllerData } from './_objects/ControllerData';
import { ApiService } from 'sb-shared-lib';
import { NodeLink } from './_objects/NodeLink';
import { Parameter } from './_objects/Parameter';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {

  public name: string = 'New Pipeline';

  public state: string = 'view';

  public nodes: Node[] = [];

  public view_offset: { x: number, y: number } = { x: 0, y: 0 };

  public selectedNode: Node | undefined;

  public links: NodeLink[] = [];

  public selectedLink: NodeLink | undefined;

  public parameters: Parameter[] = [];

  constructor(
    private router: RouterMemory,
    private api: ApiService
  ) { }

  public goBack() {
    this.router.goBack()
  }

  public newFile() {
    this.state = "view";
    this.nodes = [];
    this.view_offset = { x: 0, y: 0 };
    this.selectedNode = undefined;
    this.links = [];
  }

  public load() {
    console.log(this.parameters);
  }

  public save() { }

  get sizeViewer(): number {
    return (this.state === "add" || this.state === "edit") ? 8 : 12;
  }

  get sizeEditor(): number {
    return (this.state === "add" || this.state === "edit") ? 4 : 0;
  }

  changeState(state: string) {
    this.state = state;
  }

  async addNode(data?: ControllerData) {
    const position = { x: -this.view_offset.x + 100, y: -this.view_offset.y + 100 }
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].updatedPosition.x >= position.x - 50
        && this.nodes[i].updatedPosition.x <= position.x + 50
        && this.nodes[i].updatedPosition.y >= position.y - 50
        && this.nodes[i].updatedPosition.y <= position.y + 50) {
        position.x += 100;
        position.y += 100;
        i = -1;
      }
    }
    const node: Node = new Node(position);
    if (data) {
      const info = (await this.api.fetch(data.url + '&announce=true')).announcement;
      data.description = info.description;
      data.params = info.params;
      data.response = info.response;

      node.data = data;
      if (data.type === "actions") {
        node.icon = "open_in_browser";
        node.color = "lightcoral";
      }
      else {
        node.icon = "data_array";
        node.color = "beige";
      }
    }
    else {
      node.icon = "filter_tilt_shift";
      node.color = "whitesmoke";
    }

    this.nodes.push(node);
  }

  deleteNode(node: Node) {
    const index = this.nodes.findIndex(n => n === node);

    this.nodes.splice(index, 1);

    this.selectedNode = undefined;

    this.state = "";

    for (let i = this.links.length - 1; i >= 0; i--) {
      const link = this.links[i];
      if (link.from === node || link.to === node) {
        this.deleteLink(link);
      }
    }
  }

  editNode(node: Node) {
    if (this.selectedLink) {
      this.selectedLink.isSelected = false;
      this.selectedLink = undefined;
    }
    else if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.isSelected = false;
    }
    node.isSelected = true;
    this.selectedNode = node;
    node.data ? this.changeState("edit") : this.changeState("");
  }

  addLink(value: { nodeFrom: Node, nodeTo: Node }) {
    const nodeFrom = value.nodeFrom;
    const nodeTo = value.nodeTo;

    if (!nodeFrom.data && !nodeTo.data) {
      return
    }

    for (let link of this.links) {
      if ((link.from === nodeFrom && link.to === nodeTo)
        || (link.from === nodeTo && link.to === nodeFrom)
        || (nodeTo === link.to && nodeTo.data)) {
        return;
      }
    }
    const link = new NodeLink(nodeFrom, nodeTo);
    this.links.push(link);

    if (!nodeTo.data) {
      const name = nodeFrom.data.response.schema.name;
      const parameter = new Parameter(name, name);
      parameter.link = link;
      this.parameters.push(parameter);
    }
  }

  editLink(link: NodeLink) {
    if (this.selectedNode) {
      this.selectedNode.isSelected = false;
      this.selectedNode = undefined;
    }
    else if (this.selectedLink && this.selectedLink !== link) {
      this.selectedLink.isSelected = false;
    }
    link.isSelected = true;
    this.selectedLink = link;
    link.to.data ? this.changeState("edit") : this.changeState("");
  }

  deleteLink(link: NodeLink) {
    const index = this.links.findIndex(l => l === link);

    this.links.splice(index, 1);
    this.parameters = this.parameters.filter(param => param.link !== link);
    console.log(this.parameters);

    this.selectedLink = undefined;

    this.state = "";
  }
}