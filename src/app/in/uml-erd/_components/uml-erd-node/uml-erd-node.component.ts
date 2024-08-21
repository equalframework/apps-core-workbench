import { AfterViewChecked, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { UmlErdNode } from '../uml-erd-displayer/_objects/UmlErdNode';
import { Anchor } from '../uml-erd-displayer/_objects/UmlErdLink';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
    selector: 'uml-erd-node',
    templateUrl: './uml-erd-node.component.html',
    styleUrls: ['./uml-erd-node.component.scss']
})
export class UmlErdNodeComponent implements OnInit, AfterViewChecked {

    @ViewChild("bdy") body: ElementRef;

    anchor = Anchor;

    @Input() node: UmlErdNode;
    @Input() state: string = "normal";
    @Input() selected:boolean = false;

    @Output() createLink = new EventEmitter<void>();
    @Output() linkToMe = new EventEmitter<void>();

    typeIcon:{[id:string]:string} = {};

    constructor(
        private typeService:TypeUsageService
    ) { }

    ngOnInit(): void {
        this.typeIcon = this.typeService.typeIcon;
    }

    ngAfterViewChecked(): void {
        this.node.height = this.body.nativeElement.getBoundingClientRect().height;
        this.node.width = this.body.nativeElement.getBoundingClientRect().width;
    }

}
