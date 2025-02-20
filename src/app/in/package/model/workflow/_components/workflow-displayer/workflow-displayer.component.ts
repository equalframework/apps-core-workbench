import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { cloneDeep, max } from 'lodash';
import { WorkflowNode } from './_objects/WorkflowNode';
import { Anchor, WorkflowLink } from './_objects/WorkflowLink';

@Component({
  selector: 'app-workflow-displayer',
  templateUrl: './workflow-displayer.component.html',
  styleUrls: ['./workflow-displayer.component.scss'],
  host: {
    "(body:keydown.escape)": "onKeydown($event)",
    //"(body:mousemove)" : "trackMouse($event)",
  }
})
export class WorkflowDisplayerComponent implements OnInit,AfterViewChecked,AfterViewInit {

  @Input() state: string = "normal";
  @Input() nodes: WorkflowNode[];
  @Input() links: WorkflowLink[];
  @Input() selectedLink: number = -1;
  @Input() selectedNode: number = -1;

  @Output() requestState = new EventEmitter<string>();
  @Output() selectNode = new EventEmitter<number>();
  @Output() selectLink = new EventEmitter<number>();

  mouse_pos:WorkflowNode = new WorkflowNode("mouse");

  anchor = Anchor

  log = console.log


  offset = {x : 0, y :0}

  @ViewChild("boundary")
  boundary: ElementRef

  onKeydown($event: KeyboardEvent) {
    this.requestState.emit("normal")
  }

  get mousePosOffsetted():WorkflowNode {
    return new WorkflowNode("mouse_offset",{ position : {x : this.mouse_pos.position.x - this.offset.x , y : this.mouse_pos.position.y - this.offset.y}})
  }

  trackMouse(event:MouseEvent) {
    let boxp = this.boundary.nativeElement.getBoundingClientRect()
    let old = cloneDeep(this.mouse_pos.position)
    this.mouse_pos.position.x = event.clientX - boxp.x - 100
    this.mouse_pos.position.y = event.clientY - boxp.y + 55
    if(this.grabbed) {
      this.offset.x += (this.mouse_pos.position.x - old.x)
      this.offset.y += (this.mouse_pos.position.y - old.y)
    }
  }

  mouseDown() {
    if(['create-node'].includes(this.state)){
      const pos =  {x : this.mouse_pos.position.x - this.offset.x, y: this.mouse_pos.position.y - this.offset.y}
      console.log(pos)
      this.nodes.push(new WorkflowNode('new_node',{position : pos}))
    } else {
      this.grabbed = true
    }
    
  }

  get bgPos() {
    return `top ${this.offset.y}px left ${this.offset.x}px`
  }

  constructor() {
  }

  initialpos:WorkflowNode[]

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
     let res = document.querySelectorAll("app-workflow-node")
     res.forEach((node,index) => {
      let box = node.getBoundingClientRect()
      this.nodes[index].position.x = box.x - this.boxp.x - this.offset.x
      this.nodes[index].position.y = box.y - this.boxp.y + 56 - this.offset.y
     })
  }

  ngOnChange() {
  }

  mv(node: WorkflowNode, event: any) {
    // Dummy function to trigger a check of the view

    /*
    let boxp = this.boundary.nativeElement.getBoundingClientRect()
    let box = event.source.element.nativeElement.getBoundingClientRect()
    node.position.x = box.x - boxp.x
    node.position.y = box.y - boxp.y + 55
    */ 
  }

  getPathStringBetween(node1: WorkflowNode, node2: WorkflowNode, anchor1: Anchor, anchor2: Anchor): {path:string,center:{x:number,y:number},start:{x:number,y:number},end:{x:number,y:number}} {
    let p1 = cloneDeep(node1.position)
    let p2 = cloneDeep(node2.position)

    p1.x += this.offset.x
    p1.y += this.offset.y
    p2.x += this.offset.x
    p2.y += this.offset.y

    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.Top)
      p1.x += node1.width / 2
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.Top)
      p2.x += node2.width / 2
    if (anchor2 === Anchor.Top || anchor2 === Anchor.TopLeft || anchor2 === Anchor.TopRight)
      p2.y -= node2.height + 5
    if (anchor1 === Anchor.Top || anchor1 === Anchor.TopLeft || anchor1 === Anchor.TopRight)
      p1.y -= node2.height
    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.BottomLeft || anchor1 === Anchor.BottomRight)
      p1.y
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.BottomLeft || anchor2 === Anchor.BottomRight)
      p2.y += 15
    if (anchor1 === Anchor.TopRight || anchor1 === Anchor.MiddleRight || anchor1 === Anchor.BottomRight) {
      p1.x += node1.width
    }
    if (anchor2 === Anchor.TopRight || anchor2 === Anchor.MiddleRight || anchor2 === Anchor.BottomRight) {
      p2.x += node2.width + 10
    }

    if (anchor1 === Anchor.TopLeft || anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.BottomLeft) {
      p1.x
    }
    if (anchor2 === Anchor.TopLeft || anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.BottomLeft) {
      p2.x -= 10
    }

    if (anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.MiddleRight) {
      p1.y -= node1.height / 2
    }
    if (anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.MiddleRight) {
      p2.y -= node2.height / 2
    }

    const diffx = p2.x - p1.x
    const diffy = p2.y - p1.y

    let cp1 = cloneDeep(p1)
    let cp2 = cloneDeep(p2)

    if (anchor2 === Anchor.Top || anchor2 === Anchor.TopLeft || anchor2 === Anchor.TopRight) {
      cp2.y -= Math.min(Math.abs(diffy)/2,50)
    }
    if (anchor1 === Anchor.Top || anchor1 === Anchor.TopLeft || anchor1 === Anchor.TopRight) {
      cp1.y -= Math.min(Math.abs(diffy)/2,50)
    }
    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.BottomLeft || anchor1 === Anchor.BottomRight) {
        cp1.y += Math.min(Math.abs(diffy)/2,50)
    }
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.BottomLeft || anchor2 === Anchor.BottomRight) {
      cp2.y += Math.min(Math.abs(diffy)/2,50)
    }
    if (anchor1 === Anchor.TopRight || anchor1 === Anchor.MiddleRight || anchor1 === Anchor.BottomRight) {
      cp1.x += Math.min(Math.abs(diffx)/2,50)
    }
    if (anchor2 === Anchor.TopRight || anchor2 === Anchor.MiddleRight || anchor2 === Anchor.BottomRight) {
      cp2.x += Math.min(Math.abs(diffx)/2,50)
    }
    if (anchor1 === Anchor.TopLeft || anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.BottomLeft) {
      cp1.x -= Math.min(Math.abs(diffx)/2,50)
    }
    if (anchor2 === Anchor.TopLeft || anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.BottomLeft) {
      cp2.x -= Math.min(Math.abs(diffx)/2,50)
    }

    let center_point = {x:(p2.x + p1.x) /2,y:(p2.y +p1.y)/2}
    let h1 = cloneDeep(cp1)
    let h2 = cloneDeep(cp2)

    let diffCx = (node2.position.x + node2.width) - (node1.position.x + node1.width)
    let diffCy = (node2.position.y + node2.height) - (node1.position.y + node1.height)

    if((anchor1 === Anchor.Bottom || anchor1 === Anchor.BottomLeft || anchor1 === Anchor.BottomRight) && (anchor2 === Anchor.Top || anchor2 === Anchor.TopLeft || anchor2 === Anchor.TopRight)) {
      if(Math.abs(diffCx) < (node1.width+node2.width)-diffCy && diffCy < 0 ) {
        center_point.x -= Math.max((Math.max(node1.width,node2.width)+Math.abs(p1.x-p2.x)),100)*Math.sign(diffCx)
        h1.x = center_point.x
        h2.x = center_point.x
        return {path:`M${p1.x},${p1.y} 
        C${cp1.x},${cp1.y}
        ${h1.x},${h1.y}
        ${center_point.x},${center_point.y}
        ${h2.x},${h2.y}
        ${cp2.x},${cp2.y}
        ${p2.x},${p2.y}
        `,
        center: center_point,
        start : p1,
        end : p2
      }
      }
    }

    if((anchor2 === Anchor.Bottom || anchor2 === Anchor.BottomLeft || anchor2 === Anchor.BottomRight) && (anchor1 === Anchor.Top || anchor1 === Anchor.TopLeft || anchor1 === Anchor.TopRight)) {
      if(Math.abs(diffCx) < (node1.width+node2.width)+diffCy && diffCy > 0 ) {
        center_point.x += Math.max((Math.max(node1.width,node2.width)+Math.abs(p1.x-p2.x)),100)*Math.sign(diffCx)
        h1.x = center_point.x
        h2.x = center_point.x
        return {path:`M${p1.x},${p1.y} 
        C${cp1.x},${cp1.y}
        ${h1.x},${h1.y}
        ${center_point.x},${center_point.y}
        ${h2.x},${h2.y}
        ${cp2.x},${cp2.y}
        ${p2.x},${p2.y}
        `,
        center: center_point,
        start : p1,
        end : p2
      }
      }
    }
    if((anchor1 === Anchor.MiddleRight || anchor1 === Anchor.BottomRight || anchor1 === Anchor.TopRight) && (anchor2 === Anchor.MiddleLeft || anchor2 === Anchor.TopLeft || anchor2 === Anchor.BottomLeft) ) {
      if(Math.abs(diffCy) < (node1.height+node2.height)-diffCx && diffCx < 0 ) {
        center_point.y -= Math.max((Math.max(node1.height,node2.height)+Math.abs(p1.y-p2.y)),100)*Math.sign(diffCy)
        h1.y = center_point.y
        h2.y = center_point.y
        return  {path :`M${p1.x},${p1.y} 
        C${cp1.x},${cp1.y}
        ${h1.x},${h1.y}
        ${center_point.x},${center_point.y}
        ${h2.x},${h2.y}
        ${cp2.x},${cp2.y}
        ${p2.x},${p2.y}
        `,
        center: center_point,
        start : p1,
        end : p2
      }
      }
    }
    if((anchor2 === Anchor.MiddleRight || anchor2 === Anchor.BottomRight || anchor2 === Anchor.TopRight) && (anchor1 === Anchor.MiddleLeft || anchor1 === Anchor.TopLeft || anchor1 === Anchor.BottomLeft) ) {
      if(Math.abs(diffCy) < (node1.height+node2.height)+diffCx && diffCx > 0 ) {
        center_point.y += (Math.max(Math.max(node1.height,node2.height)+Math.abs(p1.y-p2.y)),100)*(Math.sign(diffCy) != 0 ? Math.sign(diffCy) : 1)
        h1.y = center_point.y
        h2.y = center_point.y
        return {path: `M${p1.x},${p1.y} 
          C${cp1.x},${cp1.y}
          ${h1.x},${h1.y}
          ${center_point.x},${center_point.y}
          ${h2.x},${h2.y}
          ${cp2.x},${cp2.y}
          ${p2.x},${p2.y}
          `,
          center: center_point,
          start : p1,
          end : p2
        }
      }
    }

    return { path: `M${p1.x},${p1.y} 
      C${cp1.x},${cp1.y}
      ${cp1.x},${cp1.y}
      ${(cp1.x+cp2.x)/2},${(cp1.y+cp2.y)/2}
      ${cp2.x},${cp2.y}
      ${cp2.x},${cp2.y}
      ${p2.x},${p2.y}`,
      center : {x:(cp1.x+cp2.x)/2, y:(cp1.y+cp2.y)/2},
      start : p1,
      end : p2
    }
  }

  selectForEdition(index:number) {
    this.selectLink.emit(index)
  }

  selectedAnchor: Anchor | undefined = undefined

  finishCreateLink(index: number, anchor: Anchor) {
    console.log("État actuel:", this.state);
    console.log("Nœud sélectionné:", this.selectedNode);
    console.log("Anchor sélectionné:", this.selectedAnchor);

    switch (this.state) {
        case "linking-from":
            console.log("Passage à linking-to...");
            this.selectNode.emit(index);
            this.selectedAnchor = anchor;
            this.requestState.emit("linking-to");
            break;

        case "linking-to":
            console.log("Tentative de création de lien...");
            if (this.selectedNode >= 0 && this.selectedAnchor) {
                let can_create = true;
                for (let link of this.links) {
                    if (
                        (link.from === this.nodes[this.selectedNode] && link.to === this.nodes[index] && link.anchorFrom === this.selectedAnchor && link.anchorTo === anchor) || 
                        (link.from === this.nodes[index] && link.to === this.nodes[this.selectedNode] && link.anchorFrom === anchor && link.anchorTo === this.selectedAnchor)
                    ) {
                        can_create = false;
                        this.selectNode.emit(-1);
                        this.requestState.emit("linked-failed");
                        break;
                    }
                }

                if (can_create) {
                    console.log("Création du lien...");
                    this.links.push(new WorkflowLink(
                        this.nodes[this.selectedNode], 
                        this.nodes[index], 
                        this.selectedAnchor, 
                        anchor
                    ));
                    this.selectNode.emit(-1);
                    this.requestState.emit("linking-from");
                }
            } else {
                console.warn("Erreur : selectedNode ou selectedAnchor non défini !");
            }
            break;
      case "edit-to":
        this.links[this.selectedLink].to = this.nodes[index]
        this.links[this.selectedLink].anchorTo = anchor
        this.requestState.emit('edit-link')
        break
      case "edit-from":
        this.links[this.selectedLink].from = this.nodes[index]
        this.links[this.selectedLink].anchorFrom = anchor
        this.requestState.emit('edit-link')
        break
      case "edit-node":
        this.selectNode.emit(index)
        break
    }
  }

}