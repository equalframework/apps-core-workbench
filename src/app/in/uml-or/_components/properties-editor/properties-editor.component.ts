import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { UMLORNode } from '../uml-or-displayer/_objects/UMLORNode';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';

@Component({
  selector: 'app-properties-editor',
  templateUrl: './properties-editor.component.html',
  styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnInit, OnChanges {
  @Input() state: string = ""
  @Input() nodes: UMLORNode[] = []
  @Input() selectedNode: number = -1
  @Output() addNode = new EventEmitter<string>()
  @Output() deleteNode = new EventEmitter<number>()
  @Output() needRefresh = new EventEmitter<void>()
  models: string[] = []
  hiddenvalue: string = ""
  selectable_models: string[] = []
  value: string = ""
  dp: string[] = []

  constructor(
    private api: EmbbedApiService
  ) { }

  async ngOnInit() {
    this.models = await this.api.listAllModels()
    for (let model of this.models) {
      if (this.getNodeByName(model) === null) {
        this.selectable_models.push(model)
      }
    }
  }

  async ngOnChanges() {
    console.log("CHANGED")
    this.selectable_models = []
    for (let model of this.models) {
      if (this.getNodeByName(model) === null) {
        this.selectable_models.push(model)
      }
    }
    if (this.selectedNode >= 0 && this.selectedNode < this.nodes.length) {
      this.dp = this.nodes[this.selectedNode].DisplayFields
    }
  }

  getNodeByName(name: string): UMLORNode | null {
    for (let item of this.nodes) {
      if (item.entity === name) return item
    }
    return null
  }

  add() {
    if (this.value !== "") {
      this.addNode.emit(this.value)
      this.value = ""
    }
  }

  del(index: number) {
    if (index >= 0 && index < this.nodes.length) {
      this.deleteNode.emit(index)
    }
  }

  addhidden() {
    if (this.selectedNode < 0 || this.selectedNode >= this.nodes.length) {
      return
    }
    if (this.hiddenvalue !== "" && !this.nodes[this.selectedNode].hidden.includes(this.hiddenvalue)) {
      this.nodes[this.selectedNode].hidden.push(this.hiddenvalue)
      this.hiddenvalue = ""
      this.needRefresh.emit()
    }
  }

  deletehidden(index: number) {
    if (this.selectedNode < 0 || this.selectedNode >= this.nodes.length) {
      return
    }
    if (index >= 0 && index < this.nodes[this.selectedNode].hidden.length) {
      this.nodes[this.selectedNode].hidden.splice(index, 1)
      this.needRefresh.emit()
    }
  }
}
