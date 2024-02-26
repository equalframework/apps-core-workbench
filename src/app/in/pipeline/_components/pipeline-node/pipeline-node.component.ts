import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { UMLORNode } from '../pipeline-displayer/_objects/UMLORNode';
import { Anchor } from '../pipeline-displayer/_objects/UMLORLink';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
  selector: 'app-pipeline-node',
  templateUrl: './pipeline-node.component.html',
  styleUrls: ['./pipeline-node.component.scss']
})
export class PipelineNodeComponent implements OnInit, AfterViewChecked {

  @ViewChild("bdy")
  body: ElementRef

  anchor = Anchor

  @Input() node: UMLORNode
  @Input() state: string = "normal"
  @Input() selected: boolean = false

  @Output() createLink = new EventEmitter<void>()
  @Output() linkeToMe = new EventEmitter<void>()

  typeIcon: { [id: string]: string } = {}

  constructor(
    private typeService: TypeUsageService
  ) { }

  ngOnInit(): void {
    this.typeIcon = this.typeService.typeIcon
  }

  ngAfterViewChecked(): void {
    console.log()
    this.node.height = this.body.nativeElement.getBoundingClientRect().height
    this.node.width = this.body.nativeElement.getBoundingClientRect().width
  }

}
