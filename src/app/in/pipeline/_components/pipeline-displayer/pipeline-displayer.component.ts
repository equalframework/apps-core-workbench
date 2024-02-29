import { Component } from '@angular/core';

@Component({
  selector: 'app-pipeline-displayer',
  templateUrl: './pipeline-displayer.component.html',
  styleUrls: ['./pipeline-displayer.component.scss']
})
export class PipelineDisplayerComponent {
  public isGrabbed: boolean = false;
}