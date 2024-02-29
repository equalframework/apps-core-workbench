import { Component } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ControllerNode } from './_objects/ControllerNode';

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {

  public state: string = 'view';

  public nodes: ControllerNode[] = [];

  constructor(
    private router: RouterMemory
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

  addNode(value: string) {
    console.log("je suis dans le parent");
    console.log(value);
    this.nodes;
  }
}