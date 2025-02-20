import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { cloneDeep } from 'lodash';
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
export class WorkflowDisplayerComponent implements OnInit, AfterViewInit, AfterViewChecked {

  // Expose l'énumération Anchor pour le template
  public Anchor = Anchor;

  @Input() state: string = "normal";
  @Input() nodes: WorkflowNode[] = [];
  @Input() links: WorkflowLink[] = [];
  @Input() selectedLink: number = -1;
  @Input() selectedNode: number = -1;

  @Output() requestState = new EventEmitter<string>();
  @Output() selectNode = new EventEmitter<number>();
  @Output() selectLink = new EventEmitter<number>();

  @ViewChildren('nodeElement') nodeElements: QueryList<ElementRef>;
  @ViewChild("boundary") boundary: ElementRef;

  mouse_pos: WorkflowNode = new WorkflowNode("mouse", { position: { x: 0, y: 0 } });
  offset = { x: 0, y: 0 };

  grabbed = false;

  log = console.log;

  constructor() { }

  ngOnInit(): void {
    // Optionnel : sauvegarder l'état initial
  }

  ngAfterViewInit(): void {
    if (!this.boundary) {
      console.warn("Boundary element non défini.");
    }
  }

  ngAfterViewChecked(): void {
    if (!this.boundary) { return; }
    const boundaryRect = this.boundary.nativeElement.getBoundingClientRect();
    this.nodeElements.forEach((elem, index) => {
      if (this.nodes[index]) {
        const nodeRect = elem.nativeElement.getBoundingClientRect();
        const newX = nodeRect.x - boundaryRect.x - this.offset.x;
        const newY = nodeRect.y - boundaryRect.y + 56 - this.offset.y;
        // Vous pouvez décommenter pour le débogage :
        // console.log(`Node ${index}: newX=${newX}, newY=${newY}`);
        this.nodes[index].position.x = newX;
        this.nodes[index].position.y = newY;
      }
    });
  }

  onKeydown($event: KeyboardEvent) {
    this.requestState.emit("normal");
  }

  get mousePosOffsetted(): WorkflowNode {
    return new WorkflowNode("mouse_offset", { 
      position: { 
        x: this.mouse_pos.position.x - this.offset.x, 
        y: this.mouse_pos.position.y - this.offset.y 
      } 
    });
  }

  trackMouse(event: MouseEvent) {
    if (!this.boundary) return;
    const boxp = this.boundary.nativeElement.getBoundingClientRect();
    const oldPos = cloneDeep(this.mouse_pos.position);
    this.mouse_pos.position.x = event.clientX - boxp.x - 100;
    this.mouse_pos.position.y = event.clientY - boxp.y + 55;
    if (this.grabbed) {
      this.offset.x += (this.mouse_pos.position.x - oldPos.x);
      this.offset.y += (this.mouse_pos.position.y - oldPos.y);
      // console.log(`Offset mis à jour: x=${this.offset.x}, y=${this.offset.y}`);
    }
  }

  mouseDown() {
    if (this.state === 'create-node') {
      const pos = {
        x: this.mouse_pos.position.x - this.offset.x,
        y: this.mouse_pos.position.y - this.offset.y
      };
      this.log("Création d'un nouveau nœud à la position:", pos);
      this.nodes.push(new WorkflowNode('new_node', { position: pos }));
    } else {
      this.grabbed = true;
    }
  }

  get bgPos(): string {
    return `top ${this.offset.y}px left ${this.offset.x}px`;
  }

  get boxp(): ClientRect {
    return this.boundary.nativeElement.getBoundingClientRect();
  }

  get globalNodeTranslation(): string {
    return `translate(${this.offset.x}px, ${this.offset.y}px)`;
  }

  getPathStringBetween(
    node1: WorkflowNode, 
    node2: WorkflowNode, 
    anchor1: Anchor, 
    anchor2: Anchor
  ): { path: string, center: { x: number, y: number }, start: { x: number, y: number }, end: { x: number, y: number } } {
    let p1 = cloneDeep(node1.position);
    let p2 = cloneDeep(node2.position);
    p1.x += this.offset.x; p1.y += this.offset.y;
    p2.x += this.offset.x; p2.y += this.offset.y;

    if (anchor1 === Anchor.Bottom || anchor1 === Anchor.Top) { p1.x += node1.width / 2; }
    if (anchor2 === Anchor.Bottom || anchor2 === Anchor.Top) { p2.x += node2.width / 2; }
    if ([Anchor.Top, Anchor.TopLeft, Anchor.TopRight].includes(anchor2)) { p2.y -= node2.height + 5; }
    if ([Anchor.Top, Anchor.TopLeft, Anchor.TopRight].includes(anchor1)) { p1.y -= node2.height; }
    if ([Anchor.Bottom, Anchor.BottomLeft, Anchor.BottomRight].includes(anchor2)) { p2.y += 15; }
    if ([Anchor.TopRight, Anchor.MiddleRight, Anchor.BottomRight].includes(anchor1)) { p1.x += node1.width; }
    if ([Anchor.TopRight, Anchor.MiddleRight, Anchor.BottomRight].includes(anchor2)) { p2.x += node2.width + 10; }
    if ([Anchor.TopLeft, Anchor.MiddleLeft, Anchor.BottomLeft].includes(anchor2)) { p2.x -= 10; }
    if ([Anchor.MiddleLeft, Anchor.MiddleRight].includes(anchor1)) { p1.y -= node1.height / 2; }
    if ([Anchor.MiddleLeft, Anchor.MiddleRight].includes(anchor2)) { p2.y -= node2.height / 2; }

    const diffx = p2.x - p1.x, diffy = p2.y - p1.y;
    let cp1 = cloneDeep(p1), cp2 = cloneDeep(p2);

    cp1.y += ([Anchor.Bottom, Anchor.BottomLeft, Anchor.BottomRight].includes(anchor1)) ? Math.min(Math.abs(diffy)/2, 50) : 0;
    cp2.y += ([Anchor.Bottom, Anchor.BottomLeft, Anchor.BottomRight].includes(anchor2)) ? Math.min(Math.abs(diffy)/2, 50) : 0;
    cp1.y -= ([Anchor.Top, Anchor.TopLeft, Anchor.TopRight].includes(anchor1)) ? Math.min(Math.abs(diffy)/2, 50) : 0;
    cp2.y -= ([Anchor.Top, Anchor.TopLeft, Anchor.TopRight].includes(anchor2)) ? Math.min(Math.abs(diffy)/2, 50) : 0;
    cp1.x += ([Anchor.TopRight, Anchor.MiddleRight, Anchor.BottomRight].includes(anchor1)) ? Math.min(Math.abs(diffx)/2, 50) : 0;
    cp2.x += ([Anchor.TopRight, Anchor.MiddleRight, Anchor.BottomRight].includes(anchor2)) ? Math.min(Math.abs(diffx)/2, 50) : 0;
    cp1.x -= ([Anchor.TopLeft, Anchor.MiddleLeft, Anchor.BottomLeft].includes(anchor1)) ? Math.min(Math.abs(diffx)/2, 50) : 0;
    cp2.x -= ([Anchor.TopLeft, Anchor.MiddleLeft, Anchor.BottomLeft].includes(anchor2)) ? Math.min(Math.abs(diffx)/2, 50) : 0;

    const center_point = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const path = `M${p1.x},${p1.y} C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
    return { path, center: center_point, start: p1, end: p2 };
  }

  // Méthode ajoutée pour satisfaire l'appel (cdkDragMoved)
  mv(node: WorkflowNode, event: any) {
    // Ici vous pouvez mettre à jour la position ou déclencher une vérification
    console.log("Déplacement détecté pour", node, event);
  }

  selectForEdition(index: number) {
    this.selectLink.emit(index);
  }

  selectedAnchor: Anchor | undefined = undefined;

  finishCreateLink(index: number, anchor: Anchor) {
    switch (this.state) {
      case "linking-from":
        this.selectNode.emit(index);
        this.selectedAnchor = anchor;
        this.requestState.emit("linking-to");
        break;
      case "linking-to":
        if (this.selectedNode >= 0 && this.selectedAnchor) {
          const exists = this.links.some(link =>
            link.from === this.nodes[this.selectedNode] && link.to === this.nodes[index]
          );
          if (!exists) {
            this.links.push(new WorkflowLink(this.nodes[this.selectedNode], this.nodes[index], this.selectedAnchor, anchor));
            this.selectNode.emit(-1);
            this.requestState.emit("linking-from");
          }
        }
        break;
      case "edit-to":
        this.links[this.selectedLink].to = this.nodes[index];
        this.links[this.selectedLink].anchorTo = anchor;
        this.requestState.emit('edit-link');
        break;
      case "edit-from":
        this.links[this.selectedLink].from = this.nodes[index];
        this.links[this.selectedLink].anchorFrom = anchor;
        this.requestState.emit('edit-link');
        break;
      case "edit-node":
        this.selectNode.emit(index);
        break;
    }
  }
}
