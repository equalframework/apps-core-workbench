import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnChanges, OnInit } from '@angular/core';

import * as d3 from "d3"
import { Subject } from 'rxjs';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import { WorkflowNode } from './_components/workflow-displayer/_objects/WorkflowNode';
import { Anchor, WorkflowLink, test } from './_components/workflow-displayer/_objects/WorkflowLink';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.scss']
})
export class WorkflowsComponent implements OnInit, OnChanges {

  models: string[] = []

  state:string = 'normal'

  log = console.log

  nodes:WorkflowNode[] =  []

  links:WorkflowLink[] = []

  selectedLink:number = -1

  selectedNode:number = -1


  changeState(state:string) {
    if(this.state !== state) {
      this.state = state
      if(!["linking-to"].includes(this.state)){
        this.selectedNode = -1
      }
      if(!["edit-link","edit-from","edit-to"].includes(this.state)){
        this.selectedLink = -1
      }

    }
  }



  selected_class: string = ""
  tabIndex: number = 1

  color: { type: string, color: string }[] = []
  w = 10
  h = 10

  selected_classes: string[] = ["core\\User"]

  suits = [{ "source": "Microsoft", "target": "Amazon", "type": "licensing" }, { "source": "Microsoft", "target": "HTC", "type": "licensing" }, { "source": "Samsung", "target": "Apple", "type": "suit" }, { "source": "Motorola", "target": "Apple", "type": "suit" }, { "source": "Nokia", "target": "Apple", "type": "resolved" }, { "source": "HTC", "target": "Apple", "type": "suit" }, { "source": "Kodak", "target": "Apple", "type": "suit" }, { "source": "Microsoft", "target": "Barnes & Noble", "type": "suit" }, { "source": "Microsoft", "target": "Foxconn", "type": "suit" }, { "source": "Oracle", "target": "Google", "type": "suit" }, { "source": "Apple", "target": "HTC", "type": "suit" }, { "source": "Microsoft", "target": "Inventec", "type": "suit" }, { "source": "Samsung", "target": "Kodak", "type": "resolved" }, { "source": "LG", "target": "Kodak", "type": "resolved" }, { "source": "RIM", "target": "Kodak", "type": "suit" }, { "source": "Sony", "target": "LG", "type": "suit" }, { "source": "Kodak", "target": "LG", "type": "resolved" }, { "source": "Apple", "target": "Nokia", "type": "resolved" }, { "source": "Qualcomm", "target": "Nokia", "type": "resolved" }, { "source": "Apple", "target": "Motorola", "type": "suit" }, { "source": "Microsoft", "target": "Motorola", "type": "suit" }, { "source": "Motorola", "target": "Microsoft", "type": "suit" }, { "source": "Huawei", "target": "ZTE", "type": "suit" }, { "source": "Ericsson", "target": "ZTE", "type": "suit" }, { "source": "Kodak", "target": "Samsung", "type": "resolved" }, { "source": "Apple", "target": "Samsung", "type": "suit" }, { "source": "Kodak", "target": "RIM", "type": "suit" }, { "source": "Nokia", "target": "Qualcomm", "type": "suit" }]
  test: { source: string, target: string, type: string }[] = []

  constructor(
    private api: EmbbedApiService
  ) { }

  async ngOnInit() {
    let orig = {x : 200, y:200}
    for(let node in test) {
      this.nodes.push(new WorkflowNode(node,{description:test[node].description,position : cloneDeep(orig)}))
      orig.y += 100
      orig.x += 100
    }
    for(let node in test) {
      for(let link in test[node].transitions) {
        console.log(link)
        let a = this.getNodeByName(node)
        let b = this.getNodeByName(test[node].transitions[link].status)
        console.log(test[node].transitions[link].status)
        if(a && b)
        this.links.push(
          new WorkflowLink(a,b,Anchor.MiddleRight,Anchor.MiddleLeft, Object.assign(test[node].transitions[link],{name:link}))
        )
      }
    }
    console.log(this.nodes)
    console.log(this.links)
  }

  getNodeByName(name:string):WorkflowNode|null {
    for(let item of this.nodes) {
      if(item.name === name) return item
    }
    return null
  }

  ngOnChanges() {
    console.log("CALLED")
  }

  deleteLink() {
    if(this.selectedLink >= 0)
      this.links.splice(this.selectedLink,1)
    this.selectedLink = -1
  }

  dragoff(event: CdkDragEnd) {
    console.log(event)
  }

  requestLinkFrom() {
    if(this.state !== 'linking-from' && this.state !== 'linking-to')
      this.changeState('linking-from')
  }

  get sizeViewer():number {
    switch(this.state) {
      case "normal" :
      case "link-to" :
      case "link-from" :
        return 12
      case "edit-link" :
        return 8
      default :
        return 9
    }
}

  get sizeEditor():number {
    switch(this.state) {
      case "normal" :
      case "link-to" :
      case "link-from" :
        return 0
      case "edit-link" :
        return 4
      default :
        return 3
    }
  }
}
