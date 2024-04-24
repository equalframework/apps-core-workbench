import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { WorkflowNode } from '../workflow-displayer/_objects/WorkflowNode';
import { WorkflowLink } from '../workflow-displayer/_objects/WorkflowLink';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';

@Component({
  selector: 'app-properties-editor',
  templateUrl: './properties-editor.component.html',
  styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnChanges {

  obk = Object.keys

  @Input() state:string = 'normal'

  @Input() selectedNode:number
  @Input() selectedLink:number
  @Input() modelName:string = ""
  @Input() packageName:string = ""
  @Input() model_schema:any = {}

  @Input() nodes:WorkflowNode[]
  @Input() links:WorkflowLink[]

  @Output() requestState = new EventEmitter<string>()
  @Output() requestDeleteLink = new EventEmitter<void>()
  @Output() requestDeleteNode = new EventEmitter<void>()

  inputwatch:string = ""
  inputPolicy:string = ""
  ACField:string[] = []

  constructor() { }

  fields:string[] = []

  ngOnChanges(): void {
    this.fields = Object.keys(this.model_schema['fields'])
    this.updateACField()
  }

  updateACField() {
    if(this.selectedLink > 0) {
      this.ACField =  this.fields.filter(value => !this.links[this.selectedLink].watch.includes(value))
    } else {
      this.ACField = []
    }
    
  }

  deleteWatcher(index:number) {
    if(this.selectedLink > 0) {
      this.links[this.selectedLink].watch.splice(index,1)
    }
  }

  addWatcher() {
    if(this.selectedLink > 0) {
      if (this.inputwatch && !this.links[this.selectedLink].watch.includes(this.inputwatch)) {
        this.links[this.selectedLink].watch.push(this.inputwatch)
      }
    }
  }

  deletePolicy(index:number) {
    if(this.selectedLink > 0) {
      this.links[this.selectedLink].policies.splice(index,1)
    }
  }

  addPolicy() {
    if(this.selectedLink > 0) {
      if (this.inputPolicy && !this.links[this.selectedLink].policies.includes(this.inputwatch)) {
        this.links[this.selectedLink].policies.push(this.inputPolicy)
      }
    }
  }
}
