import { Component, Input, OnInit, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { UmlErdNode } from '../uml-erd-displayer/_objects/UmlErdNode';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-entities-editor',
    templateUrl: './entities-editor.component.html',
    styleUrls: ['./entities-editor.component.scss']
})
export class EntitiesEditorComponent implements OnInit, OnChanges {
    @Input() state:string = '';
    @Input() nodes:UmlErdNode[] = [];
    @Input() selectedNode:number = -1;

    @Output() addNode = new EventEmitter<string>();
    @Output() deleteNode = new EventEmitter<number>();
    @Output() needRefresh = new EventEmitter<void>();
    @Output() requestState = new EventEmitter<string>();

    @ViewChild('fieldsSelector') fieldsSelector: MatSelect;
    @ViewChild('buttonAddEntity', { read: ElementRef }) buttonAddEntity: ElementRef;

    public packages:string[] = [];
    public models:string[] = [];
    public node: UmlErdNode;
    public selectable_entities:string[] = [];
    public value:string = "";
    public selected_package: string = 'core';

    constructor(
        private api:EmbeddedApiService
    ) {}

    public async ngOnInit() {
        this.packages = await this.api.listPackages();
        this.models = await this.api.listAllModels();
        this.updateSelectableEntities();
    }
    public onchangePackage() {
        this.updateSelectableEntities();
    }

    private updateSelectableEntities() {
        this.selectable_entities = [];
        for(let model of this.models) {
            let package_name: string = model.split('\\')[0];
            if(package_name == this.selected_package && !this.getNodeByName(model)) {
                this.selectable_entities.push(model);
            }
        }
    }

    public async ngOnChanges() {
        this.updateSelectableEntities();
        if(this.selectedNode >= 0 && this.selectedNode < this.nodes.length) {
            this.node = this.nodes[this.selectedNode];
        }
    }

    private getNodeByName(name:string): UmlErdNode|null {
        for(let node of this.nodes) {
            if(node.entity === name) {
                return node;
            }
        }
        return null;
    }

    public createNode() {
        if(this.value != "") {
            this.addNode.emit(this.value);
            this.value = "";
            setTimeout( () => {
                this.buttonAddEntity.nativeElement.focus();
            });
        }
    }

    public removeNode(index:number) {
        if(index >= 0 && index < this.nodes.length) {
            this.deleteNode.emit(index);
        }
    }

    public addFieldsUnselectAll() {
        this.fieldsSelector.options.forEach((item: MatOption) => item.deselect());
    }

    public addFieldsSelectAll() {
        this.fieldsSelector.options.forEach((item: MatOption) => item.select());
    }

    public fieldDrop(event:any) {
        moveItemInArray(this.node.fields, event.previousIndex, event.currentIndex);
        this.needRefresh.emit();
    }

    public addFields() {
        const new_fields = this.fieldsSelector.value;
        for(let field of new_fields) {
            this.node.addField(field);
        }
        // empty selection
        this.fieldsSelector.value = [];
        this.needRefresh.emit();
    }

    public removeField(field: string) {
        this.node.hideField(field);
        this.needRefresh.emit();
        setTimeout(() => {
            this.node.hidden.splice(0, 0);
        })
    }
}
