import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { cloneDeep, max } from 'lodash';
import { UMLORNode } from './_objects/UMLORNode';
import { Anchor, UMLORLink } from './_objects/UMLORLink';
import { sign } from 'crypto';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pipeline-displayer',
  templateUrl: './pipeline-displayer.component.html',
  styleUrls: ['./pipeline-displayer.component.scss'],
  host: {
    "(body:keydown.escape)": "onKeydown($event)",
    //"(body:mousemove)" : "trackMouse($event)",
  }
})
export class PipelineDisplayerComponent implements OnInit, AfterViewChecked, AfterViewInit {

  @Input() state: string = "normal"


  @Input() nodes: UMLORNode[]

  @Input() links: UMLORLink[]

  @Input() selectedLink: number = -1

  @Input() selectedNode: number = -1

  @Output() requestState = new EventEmitter<string>()
  @Output() selectNode = new EventEmitter<number>()

  mouse_pos: UMLORNode = new UMLORNode("mouse")

  anchor = Anchor

  @Input() offset = { x: 0, y: 0 }

  @ViewChild("boundary")
  boundary: ElementRef

  onKeydown($event: KeyboardEvent) {
    this.requestState.emit("normal")
  }


  get mousePosOffsetted(): UMLORNode {
    return new UMLORNode("mouseoffset")
  }

  trackMouse(event: MouseEvent) {
    let boxp = this.boundary.nativeElement.getBoundingClientRect()
    let old = cloneDeep(this.mouse_pos.position)
    this.mouse_pos.position.x = event.clientX - boxp.x - 100
    this.mouse_pos.position.y = event.clientY - boxp.y + 55
    if (this.grabbed) {
      this.offset.x += (this.mouse_pos.position.x - old.x)
      this.offset.y += (this.mouse_pos.position.y - old.y)
    }
  }

  mouseDown(evt: MouseEvent) {
    if (evt.which && evt.which === 3) {  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera 
      return
    }
    else if (evt.button && evt.button === 2) { // IE, Opera 
      return
    }
    this.grabbed = true
  }

  get bgPos() {
    return `top ${this.offset.y}px left ${this.offset.x}px`
  }

  constructor() {
  }

  initialpos: UMLORNode[]

  grabbed = false

  ngOnInit(): void {
    this.initialpos = cloneDeep(this.nodes)
  }

  get boxp() {
    return this.boundary.nativeElement.getBoundingClientRect()
  }

  ngAfterViewInit(): void {

  }

  get globalNodeTranslation() {
    return `translate(${this.offset.x}px,${this.offset.y}px)`
  }

  ngAfterViewChecked(): void {
    let res = document.querySelectorAll("app-uml-or-node")
    res.forEach((node, index) => {
      let box = node.getBoundingClientRect()
      this.nodes[index].position.x = box.x - this.boxp.x - this.offset.x
      this.nodes[index].position.y = box.y - this.boxp.y + 56 - this.offset.y
    })
  }

  ngOnChange() {
  }

  mv(node: UMLORNode, event: any) {
    // Dummy function to trigger a check of the view
  }

  getPathStringBetween(node1: UMLORNode, node2: UMLORNode, anchor1: number, anchor2: number, type: string): { path: string, center: { x: number, y: number }, start: { x: number, y: number }, end: { x: number, y: number } } {
    let alt: boolean
    try {
      alt = type === "many2many" && anchor2 >= 0 && node2.fields[node2.DisplayFields[anchor2]].foreign_object === node1.entity
    } catch {
      alt = true
    }
    let p1 = cloneDeep(node1.position)
    let p2 = cloneDeep(node2.position)

    p1.y += this.offset.y + 15 * anchor1 - 10.5
    p2.y += this.offset.y + 15 * anchor2 - 10.5

    let p1_1 = cloneDeep(p1)
    let p2_1 = cloneDeep(p2)

    p1.x += this.offset.x - 10
    p2.x += this.offset.x
    if (alt) {
      p2.x -= 10
    }
    const amount = (!(p1.x + node1.width < p2.x) && !(p2.x + node2.width < p1.x)) ? Math.abs(p1.y - p2.y) * 0.2 + 20 : Math.min(Math.abs(p1.x - p2.x) / 4 + 10, 50)
    p1_1.x += this.offset.x - amount - 10
    p2_1.x += this.offset.x - amount - 10

    if (p1.x + node1.width < p2.x) {
      p1.x += node1.width + 20
      p1_1.x += node1.width + amount * 2 + 20
    }

    if (p2.x + node2.width < p1.x) {
      p2.x += node2.width
      p2_1.x += node2.width + amount * 2
      if (alt) {
        p2.x += 20
        p2_1.x += 20
      }
    }

    return {
      path: `M ${p1.x},${p1.y} C ${p1_1.x},${p1_1.y} ${p2_1.x},${p2_1.y} ${p2.x},${p2.y} `,
      center: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      start: p1,
      end: p2
    }
  }

  selectForEdition(index: number) {
    this.selectNode.emit(index)
  }

}