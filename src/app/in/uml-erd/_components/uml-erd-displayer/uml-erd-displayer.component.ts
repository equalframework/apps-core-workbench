import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild, SimpleChanges } from '@angular/core';

import { cloneDeep, max } from 'lodash';
import { UmlErdNode } from './_objects/UmlErdNode';
import { Anchor, UmlErdLink } from './_objects/UmlErdLink';

@Component({
  selector: 'uml-erd-displayer',
  templateUrl: './uml-erd-displayer.component.html',
  styleUrls: ['./uml-erd-displayer.component.scss'],
  host: {
    "(body:keydown.escape)": "onKeydown($event)",
    "(body:mousemove)" : "onMouseMove($event)",
    "(mouseleave)": "onMouseLeave($event)"
  }
})
export class UmlErdDisplayerComponent implements OnInit, OnChanges, AfterViewChecked, AfterViewInit {

    @ViewChild("boundary") boundary: ElementRef;

    @Input() state: string = "normal";
    @Input() nodes: UmlErdNode[];
    @Input() links: UmlErdLink[];
    @Input() selectedLink: number = -1;

    public zoom: number = 1.0;
    public selectedNode: UmlErdNode | null = null;

    // offset viewport (initially set at loading)
    public offset = {x : 0, y :0};

    @Output() requestState = new EventEmitter<string>();
    @Output() selectNode = new EventEmitter<number>();

    public initialMousePos: {x: number, y: number} = {x: 0, y: 0};
    public currentMousePos: {x: number, y: number} = {x: 0, y: 0};

    public anchor = Anchor;
    public is_mousedown: boolean = false;
    public is_node_captured: boolean = false;


    constructor() {
    }

    public ngOnInit(): void {

    }

    public ngOnChanges(changes: SimpleChanges): void {
        console.log(changes);
    }

    public ngAfterViewInit(): void {

    }

    private fetchMousePos(event: MouseEvent) {
        const boxp = this.boundary.nativeElement.getBoundingClientRect();

        return {
            x: event.clientX - boxp.x - 100,
            y: event.clientY - boxp.y + 55
        };
    }

    public zoomIn() {
        this.zoom += 0.15;
    }

    public zoomOut() {
        this.zoom -= 0.15;
    }

    public onKeydown($event: KeyboardEvent) {
        this.requestState.emit("normal");
    }

    public onMouseMove(event: MouseEvent) {
        // update current mouse position
        const currentPos = this.fetchMousePos(event);
        // move viewport if mouse button is pressed
        if(this.is_mousedown) {
            this.offset.x += (currentPos.x - this.currentMousePos.x);
            this.offset.y += (currentPos.y - this.currentMousePos.y);
        }
        this.currentMousePos = currentPos;

        // #memo - node only receive mousemove event when hovered
        if(this.is_node_captured && this.selectedNode) {
            this.onMoveNode(this.selectedNode, event);
        }
    }

    public onMouseDown(event: MouseEvent) {
        console.log('mouse down', event);
        this.initialMousePos = this.fetchMousePos(event);
        this.currentMousePos = this.fetchMousePos(event);
        this.is_mousedown = true;
        this.is_node_captured = false;
    }

    public onMouseUp(event: MouseEvent) {
        console.log('mouse up');
        this.is_mousedown = false;
        this.is_node_captured = false;
    }

    public onMouseLeave() {
        this.selectedNode = null;
        this.is_node_captured = false;
        this.is_mousedown = false;
    }

    public get bgPos() {
        return `top ${this.offset.y}px left ${this.offset.x}px`
    }

    public get boxp() {
        return this.boundary.nativeElement.getBoundingClientRect();
    }

    public get globalNodeTranslation() {
        return `translate(${this.offset.x}px,${this.offset.y}px)`;
    }

    public ngAfterViewChecked(): void {
        document.querySelectorAll("app-uml-or-node").forEach((node, index) => {
            let box = node.getBoundingClientRect();
            this.nodes[index].position.x = box.x - this.boxp.x - this.offset.x;
            this.nodes[index].position.y = box.y - this.boxp.y + 56 - this.offset.y;
        });
    }

    public ngOnChange() {
    }

    public onMoveNode(node: UmlErdNode, event: any) {
        // event.stopPropagation();
        if(node === this.selectedNode && this.is_node_captured) {
            let offset_x = this.initialMousePos.x - this.currentMousePos.x;
            let offset_y = this.initialMousePos.y - this.currentMousePos.y;
            node.position.x = node.initialPos.x - offset_x;
            node.position.y = node.initialPos.y - offset_y;
            console.log(node);
        }
    }

    public onCaptureNode(node: UmlErdNode, event: MouseEvent) {
        event.stopPropagation();
        this.initialMousePos = this.fetchMousePos(event);
        this.currentMousePos = this.fetchMousePos(event);
        this.selectedNode = node;
        this.is_node_captured = true;
        this.requestState.emit('edit-node');
        const index = this.nodes.findIndex(elem => elem === node);
        this.selectNode.emit(index);
    }

    public onReleaseNode(node: UmlErdNode, event: MouseEvent) {
        event.stopPropagation();
        this.is_node_captured = false;
        node.initialPos.x = node.position.x;
        node.initialPos.y = node.position.y;
    }

    public getPathStringBetween(node1: UmlErdNode, node2: UmlErdNode, anchor1: number, anchor2: number, type:string): {path:string,center:{x:number,y:number},start:{x:number,y:number},end:{x:number,y:number}} {
        let alt: boolean;
        try {
            alt = (type === "many2many" && anchor2 >= 0) && (node2.schema[node2.fields[anchor2]].foreign_object === node1.entity);
        }
        catch {
            alt = true;
        }
        let p1 = cloneDeep(node1.position);
        let p2 = cloneDeep(node2.position);

        // use offset and add space between links
        p1.y += this.offset.y + (15 * anchor1) - 10.5;
        p2.y += this.offset.y + (15 * anchor2) - 10.5;

        let p1_1 = cloneDeep(p1);
        let p2_1 = cloneDeep(p2);

        p1.x += this.offset.x - 10;
        p2.x += this.offset.x;

        if(alt) {
            p2.x -= 10;
        }

        const node1_width = node1.width * (1/this.zoom);
        const node2_width = node2.width * (1/this.zoom);

        const amount = (!(p1.x + node1_width < p2.x) && !(p2.x + node2_width < p1.x)) ? Math.abs(p1.y -p2.y) * 0.2 + 20 : Math.min(Math.abs(p1.x - p2.x)/4 + 10, 50);
        p1_1.x += (this.offset.x - amount - 10);
        p2_1.x += (this.offset.x - amount - 10);

        if(p1.x + node1_width < p2.x) {
            p1.x += node1_width + 20;
            p1_1.x += node1_width + amount*2 + 20;
        }

        if(p2.x + node2_width < p1.x) {
            p2.x += node2_width;
            p2_1.x += node2_width + amount*2;
            if(alt) {
                p2.x += 20;
                p2_1.x += 20;
            }
        }

        return {
            path : `M ${p1.x},${p1.y} C ${p1_1.x},${p1_1.y} ${p2_1.x},${p2_1.y} ${p2.x},${p2.y} `,
            center : {x : (p1.x + p2.x) / 2, y : (p1.y + p2.y) / 2},
            start : p1,
            end : p2
        };
    }
}