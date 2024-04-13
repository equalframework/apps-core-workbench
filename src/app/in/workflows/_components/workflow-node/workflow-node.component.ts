import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { WorkflowNode } from '../workflow-displayer/_objects/WorkflowNode';
import { Anchor } from '../workflow-displayer/_objects/WorkflowLink';

@Component({
  selector: 'app-workflow-node',
  templateUrl: './workflow-node.component.html',
  styleUrls: ['./workflow-node.component.scss']
})
export class WorkflowNodeComponent implements OnInit, AfterViewChecked {

  @ViewChild("bdy")
  body: ElementRef

  anchor = Anchor

  @Input() node: WorkflowNode
  @Input() state: string = "normal"
  @Input() selected:boolean = false

  @Output() createLink = new EventEmitter<void>()
  @Output() linkToMe = new EventEmitter<Anchor>()


  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    console.log()
    this.node.height = this.body.nativeElement.getBoundingClientRect().height
    this.node.width = this.body.nativeElement.getBoundingClientRect().width
  }

}
