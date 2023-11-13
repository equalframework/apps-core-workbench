import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { cloneDeep, max } from 'lodash';
import { WorkflowNode } from './_objects/WorkflowNode';
import { Anchor, WorkflowLink } from './_objects/WorkflowLink';

@Component({
  selector: 'app-workflow-displayer',
  templateUrl: './workflow-displayer.component.html',
  styleUrls: ['./workflow-displayer.component.scss'],
  host: {
    "(body:keydown.escape)": "onKeydown($event)"
  }
})
export class WorkflowDisplayerComponent implements OnInit {

  @ViewChild("boundary")
  boundary: ElementRef

  onKeydown($event: KeyboardEvent) {
    this.state = 'normal'
  }

  nodes = [
    new WorkflowNode("start"),
    new WorkflowNode("end")
  ]

  links: WorkflowLink[] = []

  state = "linking-from"


  constructor() {
    this.nodes[0].position.x = 300
  }

  ngOnInit(): void {
  }

  mv(node: WorkflowNode, event: any) {
    let boxp = this.boundary.nativeElement.getBoundingClientRect()
    let box = event.source.element.nativeElement.getBoundingClientRect()
    console.log(boxp.y)
    node.position.x = box.x - boxp.x
    node.position.y = box.y - boxp.y + 55
  }

  getPathStringBetween(node1: WorkflowNode, node2: WorkflowNode, anchor1: Anchor, anchor2: Anchor): string {
    let p1 = cloneDeep(node1.position)
    let p2 = cloneDeep(node2.position)

    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.Top)
      p1.x += node1.width / 2
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.Top)
      p2.x += node2.width / 2
    if (anchor2 === Anchor.Top || anchor2 === Anchor.TopLeft || anchor2 === Anchor.TopRight)
      p2.y -= node2.height + 5
    if (anchor1 === Anchor.Top || anchor1 === Anchor.TopLeft || anchor1 === Anchor.TopRight)
      p1.y -= node2.height + 5
    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.BottomLeft || anchor1 === Anchor.BottomRight)
      p1.y += 10
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.BottomLeft || anchor2 === Anchor.BottomRight)
      p2.y += 10
    if (anchor1 === Anchor.TopRight || anchor1 === Anchor.MiddleRight || anchor1 === Anchor.BottomRight) {
      p1.x += node1.width
    }
    if (anchor2 === Anchor.TopRight || anchor2 === Anchor.MiddleRight || anchor2 === Anchor.BottomRight) {
      p2.x += node2.width
    }

    if (anchor1 === Anchor.TopLeft || anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.BottomLeft) {
      p1.x -= 10
    }
    if (anchor2 === Anchor.TopLeft || anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.BottomLeft) {
      p2.x -= 10
    }

    if (anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.MiddleRight) {
      p1.y -= node1.height / 2 - 5
    }
    if (anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.MiddleRight) {
      p2.y -= node2.height / 2 - 5
    }

    const diffx = p2.x - p1.x
    const diffy = p2.y - p1.y

    console.log(diffx + " " + diffy)

    let c1p1 = cloneDeep(p1)
    let c1p2 = cloneDeep(p2)

    if (anchor2 === Anchor.Top || anchor2 === Anchor.TopLeft || anchor2 === Anchor.TopRight) {
      c1p2.y -= 100
    }
    if (anchor1 === Anchor.Top || anchor1 === Anchor.TopLeft || anchor1 === Anchor.TopRight) {
      c1p1.y -= 100
    }
    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.BottomLeft || anchor1 === Anchor.BottomRight) {
      if (diffx < 0 && diffy < 0) {
        c1p1.y -= node1.height + 100
      }else {
        c1p1.y += 100
      }
      
    }
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.BottomLeft || anchor2 === Anchor.BottomRight) {
      c1p2.y += 100
    }
    if (anchor1 === Anchor.TopRight || anchor1 === Anchor.MiddleRight || anchor1 === Anchor.BottomRight) {
      c1p1.x += 100
    }
    if (anchor2 === Anchor.TopRight || anchor2 === Anchor.MiddleRight || anchor2 === Anchor.BottomRight) {
      c1p2.x += 100
    }
    if (anchor1 === Anchor.TopLeft || anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.BottomLeft) {
      c1p1.x -= 100
    }
    if (anchor2 === Anchor.TopLeft || anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.BottomLeft) {
      c1p2.x -= 100
    }

    return `M${p1.x},${p1.y} 
      C${c1p1.x},${c1p1.y}
      ${c1p2.x},${c1p2.y}
      ${p2.x},${p2.y}
    `
  }

  clickedOnLink(index: number) {
    console.log("LEZGONGUE " + index)
  }

  selectedLinkingNode = -1

  selectedAnchor: Anchor | undefined = undefined

  startCreateLink(index: number) {
    if (this.state === 'normal') {
      this.state = 'linking'
      this.selectedLinkingNode = index
    }
  }

  finishCreateLink(index: number, anchor: Anchor) {
    switch (this.state) {
      case "linking-from":
        this.selectedLinkingNode = index
        this.selectedAnchor = anchor
        this.state = "linking-to"

        break
      case "linking-to":
        if (this.selectedLinkingNode >= 0 && this.selectedAnchor) {
          let can_create: boolean = true
          for (let link of this.links) {
            if (link.from === this.nodes[this.selectedLinkingNode] && link.to === this.nodes[index]) {
              can_create = false
              break
            }
          }
          if (can_create) {
            this.links.push(new WorkflowLink("all", this.nodes[this.selectedLinkingNode], this.nodes[index], this.selectedAnchor, anchor))
            this.selectedLinkingNode = -1
            this.state = 'normal'
          }
        }
    }
  }

}