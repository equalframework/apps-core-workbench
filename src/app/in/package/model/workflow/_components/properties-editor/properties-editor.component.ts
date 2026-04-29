    import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
    import { WorkflowNode } from '../workflow-displayer/_objects/WorkflowNode';
    import { WorkflowLink } from '../workflow-displayer/_objects/WorkflowLink';

    @Component({
    selector: 'app-properties-editor',
    templateUrl: './properties-editor.component.html',
    styleUrls: ['./properties-editor.component.scss']
    })
    export class PropertiesEditorComponent implements OnChanges {

    obk = Object.keys;

    @Input() state = 'normal';

    @Input() selectedNode: number;
    @Input() selectedLink: number;
    @Input() modelName = '';
    @Input() packageName = '';
    @Input() modelSchema: any = {};

    @Input() nodes: WorkflowNode[];
    @Input() links: WorkflowLink[];

    @Output() requestState = new EventEmitter<string>();
    @Output() requestDeleteLink = new EventEmitter<void>();
    @Output() requestDeleteNode = new EventEmitter<void>();

    inputWatch = '';
    inputPolicy = '';
    ACField: string[] = [];

    constructor() { }

    fields: string[] = [];

    ngOnChanges(): void {

        if (this.selectedNode >= 0) {
            if (this.modelSchema && this.modelSchema['fields']) {
                this.fields = Object.keys(this.modelSchema['fields']);
                this.updateACField();
            } else {
                console.warn('model_schema ou model_schema["fields"] est undefined ou null');
            }
            } else if (this.selectedLink >= 0) {
            this.updateACField();
        }
        else {
            this.fields = [];
            this.updateACField();
        }
    }


    updateACField(): void {
        if (this.selectedLink >= 0) {
            this.ACField =  this.fields.filter(value => !this.links[this.selectedLink].watch.includes(value));
            } else {
            this.ACField = [];
        }

    }

    deleteWatcher(index: number): void {
        if (this.selectedLink >= 0) {
            this.links[this.selectedLink].watch.splice(index, 1);
        }
    }

    addWatcher(): void {
        if (this.selectedLink >= 0) {
            if (this.inputWatch && !this.links[this.selectedLink].watch.includes(this.inputWatch)) {
                this.links[this.selectedLink].watch.push(this.inputWatch);
            }
        }
    }

    deletePolicy(index: number): void {
        if (this.selectedLink >= 0) {
            this.links[this.selectedLink].policies.splice(index, 1);
        }
    }

    addPolicy(): void {
        if (this.selectedLink >= 0) {
            if (this.inputPolicy && !this.links[this.selectedLink].policies.includes(this.inputPolicy)) {
                this.links[this.selectedLink].policies.push(this.inputPolicy);
            }
        }
    }
    }
