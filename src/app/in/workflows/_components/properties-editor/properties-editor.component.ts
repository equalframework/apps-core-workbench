import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { WorkflowNode } from '../workflow-displayer/_objects/WorkflowNode';
import { WorkflowLink } from '../workflow-displayer/_objects/WorkflowLink';

@Component({
  selector: 'app-properties-editor',
  templateUrl: './properties-editor.component.html',
  styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnInit {


  @Input() state:string = 'normal'

  @Input() selectedNode:number
  @Input() selectedLink:number

  @Input() nodes:WorkflowNode[]
  @Input() links:WorkflowLink[]

  @Output() requestState = new EventEmitter<string>()
  @Output() requestDeleteLink = new EventEmitter<void>()


  constructor() { }

  ngOnInit(): void {
  }
}
