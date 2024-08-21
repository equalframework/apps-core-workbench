import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, Inject, OnChanges, OnInit, Optional } from '@angular/core';

import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { WorkflowNode } from './_components/workflow-displayer/_objects/WorkflowNode';
import { Anchor, WorkflowLink, test } from './_components/workflow-displayer/_objects/WorkflowLink';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'package-model-workflow',
  templateUrl: './package-model-workflow.component.html',
  styleUrls: ['./package-model-workflow.component.scss']
})
export class PackageModelWorkflowComponent implements OnInit, OnChanges {

    public models: string[] = [];
    public state:string = 'normal';

    log = console.log

    public nodes:WorkflowNode[] =  [];
    public links:WorkflowLink[] = [];
    public selectedLink:number = -1;
    public selectedNode:number = -1;
    public package:string = "";
    public model:string = "";
    public model_scheme:any = {};
    public need_save:boolean = false;
    public selected_class: string = "";
    public tabIndex: number = 1;

    public color: { type: string, color: string }[] = [];
    public w = 10;
    public h = 10;

    public selected_classes: string[] = ["core\\User"];

    public suits = [{ "source": "Microsoft", "target": "Amazon", "type": "licensing" }, { "source": "Microsoft", "target": "HTC", "type": "licensing" }, { "source": "Samsung", "target": "Apple", "type": "suit" }, { "source": "Motorola", "target": "Apple", "type": "suit" }, { "source": "Nokia", "target": "Apple", "type": "resolved" }, { "source": "HTC", "target": "Apple", "type": "suit" }, { "source": "Kodak", "target": "Apple", "type": "suit" }, { "source": "Microsoft", "target": "Barnes & Noble", "type": "suit" }, { "source": "Microsoft", "target": "Foxconn", "type": "suit" }, { "source": "Oracle", "target": "Google", "type": "suit" }, { "source": "Apple", "target": "HTC", "type": "suit" }, { "source": "Microsoft", "target": "Inventec", "type": "suit" }, { "source": "Samsung", "target": "Kodak", "type": "resolved" }, { "source": "LG", "target": "Kodak", "type": "resolved" }, { "source": "RIM", "target": "Kodak", "type": "suit" }, { "source": "Sony", "target": "LG", "type": "suit" }, { "source": "Kodak", "target": "LG", "type": "resolved" }, { "source": "Apple", "target": "Nokia", "type": "resolved" }, { "source": "Qualcomm", "target": "Nokia", "type": "resolved" }, { "source": "Apple", "target": "Motorola", "type": "suit" }, { "source": "Microsoft", "target": "Motorola", "type": "suit" }, { "source": "Motorola", "target": "Microsoft", "type": "suit" }, { "source": "Huawei", "target": "ZTE", "type": "suit" }, { "source": "Ericsson", "target": "ZTE", "type": "suit" }, { "source": "Kodak", "target": "Samsung", "type": "resolved" }, { "source": "Apple", "target": "Samsung", "type": "suit" }, { "source": "Kodak", "target": "RIM", "type": "suit" }, { "source": "Nokia", "target": "Qualcomm", "type": "suit" }]
    public test: { source: string, target: string, type: string }[] = []
    public has_meta_data:number;
    public exists:boolean = false;

    constructor(
        private api: EmbeddedApiService,
        private router:RouterMemory,
        private activatedRoute:ActivatedRoute,
        private matDialog:MatDialog,
        private snackBar:MatSnackBar
    ) { }

    async ngOnInit() {
        await this.init();
    }

    async init() {
        const map = this.activatedRoute.snapshot.paramMap;
        const a = map.get("package");
        const b = map.get("model");
        if(a) {
            this.package = a;
        }
        if(b) {
            this.model = b;
        }
        this.nodes = [];
        this.links = [];
        const r = await this.api.getWorkflow(this.package, this.model)
        if(r.exists !== null && r.exists !== undefined) {
            this.exists = r.exists;
            const metadata = await this.api.fetchMetaData('workflow',this.package+'.'+this.model);
            this.has_meta_data = Object.keys(metadata).length > 0 ? metadata[0].id : undefined;
            this.model_scheme = await this.api.getSchema(this.package+"\\"+this.model);
            const res = r.info;
            let orig = {x : 200, y:200};
            let mdt:any = {};
            if(this.has_meta_data) {
                mdt = JSON.parse(metadata[0].value);
            }
            // make sure first node is always visible
            let offset_x: number = 0;
            let offset_y: number = 0;
            let is_first: boolean = true;
            for(let node in res) {
                let pos = (!this.has_meta_data || !mdt || !mdt[node] || !mdt[node].position)  ? cloneDeep(orig) : mdt[node].position;
                if(is_first && pos.x < 200) {
                    offset_x = -pos.x + 200;
                }
                if(is_first && pos.y < 200) {
                    offset_y = -pos.y + 200;
                }
                pos.x += offset_x;
                pos.y += offset_y;
                this.nodes.push(new WorkflowNode(node, {
                            description: res[node].description,
                            position : pos,
                            help: res[node].help,
                            icon: res[node].icon
                        })
                    );
                orig.y += 100;
                orig.x += 100;
                is_first = false;
            }
            for(let node in res) {
                for(let link in res[node].transitions) {
                    let a = this.getNodeByName(node);
                    let b = this.getNodeByName(res[node].transitions[link].status);

                    if(!b) {
                        b = new WorkflowNode(res[node].transitions[link].status,{position : cloneDeep(orig)});
                        this.nodes.push(b);
                        orig.y += 100;
                        orig.x += 100;
                        this.need_save = true;
                    }
                    if(a && b) {
                        const anch1 = (!this.has_meta_data || !mdt || !mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] ||!mdt[a.name].transitions[link].anchorFrom)
                            ? Anchor.MiddleRight
                            : mdt[a.name].transitions[link].anchorFrom;
                        const anch2 = (!this.has_meta_data || !mdt || !mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] || !mdt[a.name].transitions[link].anchorFrom)
                            ? Anchor.MiddleLeft
                            : mdt[a.name].transitions[link].anchorTo;
                        this.links.push(
                            new WorkflowLink(a,b,anch1,anch2, Object.assign(res[node].transitions[link],{name:link}))
                        );
                    }
                }
            }
        }
    }

    public reset() {
        this.init()
    }

    public changeState(state:string) {
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

    private getNodeByName(name:string):WorkflowNode|null {
        for(let item of this.nodes) {
            if(item.name === name) {
                return item;
            }
        }
        return null;
    }

    public ngOnChanges() {
        console.log("CALLED");
    }

    public deleteLink() {
        if(this.selectedLink >= 0) {
            this.links.splice(this.selectedLink, 1);
        }
        this.selectedLink = -1;
    }

    public deleteNode() {
        if(this.selectedNode >= 0) {
            const deleted = this.nodes.splice(this.selectedNode, 1);
            let new_links = [];
            for(let link of this.links) {
                if(link.from === deleted[0] || link.to === deleted[0] ) {
                    continue;
                }
                new_links.push(link);
            }
            this.links = new_links;
            this.selectedNode = -1;
        }
    }

    public dragoff(event: CdkDragEnd) {
        console.log(event);
    }

    public requestLinkFrom() {
        if(this.state !== 'linking-from' && this.state !== 'linking-to') {
            this.changeState('linking-from');
        }
    }

    get sizeViewer(): number {
        switch(this.state) {
            case "normal" :
            case "link-to" :
            case "link-from" :
                return 12;
            case "edit-link" :
                return 8;
            default :
                return 9;
        }
    }

    get sizeEditor():number {
        switch(this.state) {
            case "normal" :
            case "link-to" :
            case "link-from" :
                return 0;
            case "edit-link" :
                return 4;
            default :
                return 3;
        }
    }

    public goBack() {
        this.router.goBack();
    }

    public export() {
        let result:{[id:string]:any} = {};
        for(let node of this.nodes) {
            result[node.name] = node.export();
            result[node.name].transitions = {};
            for(let link of this.links) {
                if(link.from === node){
                    result[node.name].transitions[link.name] = link.export();
                }
            }
        }
        return result;
    }

    public exportMetaData() {
        let result:{[id:string]:any} = {};
        for(let node of this.nodes) {
            result[node.name] = node.generateMetaData();
            result[node.name].transitions = {};
            for(let link of this.links) {
                if(link.from === node){
                    result[node.name].transitions[link.name] = link.generateMetaData();
                }
            }
        }
        return result;
    }

    public async save() {
        if(!this.exists) {
            const create = await this.api.createWorkflow(this.package,this.model)
            if(!create){
                return;
            }
        }
        const ret = await this.api.saveWorkflow(this.package,this.model,JSON.stringify(this.export()))
        if(!ret){
            return;
        }
        let rmd = false;
        if(this.has_meta_data) {
            rmd = await this.api.saveMetaData(this.has_meta_data,JSON.stringify(this.exportMetaData()));
        }
        else {
            rmd = await this.api.createMetaData("workflow",this.package+"."+this.model,JSON.stringify(this.exportMetaData()));
        }
        if(!rmd) {
            return;
        }
        this.snackBar.open("Saved successfully","INFO");
        this.init();
    }

    public showJSON() {
        this.matDialog.open(Jsonator,{data:this.export(), width:"70vw", height:"85vh"});
    }

    public showJSONMetaData() {
        this.matDialog.open(Jsonator,{data:this.exportMetaData(), width:"70vw", height:"85vh"});
    }

    public navigateToParent() {
        if(this.model_scheme.parent !== "model") {
            this.router.navigate(["workflow",this.model_scheme.parent.split("\\")[0],this.model_scheme.parent.split("\\").slice(1).join("\\")])
        }
    }

    public customButtonBehavior(evt:string) {
        switch( evt ) {
            case "Show JSON" :
                this.showJSON();
                break
            case "Show JSON meta data" :
                this.showJSONMetaData();
                break
        }
    }
}

@Component({
    selector: 'jsonator',
    template: "<pre [innerHtml]='datajson'><pre>"
})
class Jsonator {
    constructor(
        @Optional() public dialogRef: MatDialogRef<Jsonator>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data:any,
    ) {}

    get datajson() {
        return prettyPrintJson.toHtml(this.data)
    }
}