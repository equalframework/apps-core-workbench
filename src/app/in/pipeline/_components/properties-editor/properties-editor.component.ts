import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ControllerData } from '../../_objects/ControllerData';
import { Node } from '../../_objects/Node';
import { NodeLink } from '../../_objects/NodeLink';
import { Parameter } from '../../_objects/Parameter';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { ModalNameDescriptionComponent } from '../modal-name-description/modal-name-description.component';

@Component({
    selector: 'app-properties-editor',
    templateUrl: './properties-editor.component.html',
    styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnInit {
    @Input() state: string = "";

    @Output() changeState = new EventEmitter<string>();

    public searchType: string = "All";

    public searchTypes: string[] = ["All", "Package", "Data", "Actions"];

    public iconMapping: { [key: string]: string } = {
        "All": "category",
        "Package": "inventory",
        "Data": "data_array",
        "Actions": "open_in_browser"
    };

    public package: string = "";

    public packages: string[] = [];

    public controllers: ControllerData[] = [];

    public searchValue: string = "";

    public filterData: ControllerData[] = [];

    @Output() addNode = new EventEmitter<ControllerData>();

    @Input() selectedNode: Node | undefined;

    public icons: string[] = ["data_array", "open_in_browser", "delete", "home", "search", "star"];

    public colors: string[] = ["whitesmoke", "beige", "lightcoral", "lightblue", "lightseagreen"];

    @Input() selectedLink: NodeLink | undefined;

    @Input() nodes: Node[];

    @Input() links: NodeLink[];

    @Input() parameters: Parameter[];

    public typeIcon: { [id: string]: string } = {};

    @Output() changePipeline = new EventEmitter<undefined>();

    constructor(
        private api: ApiService,
        private typeUsage: TypeUsageService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.typeIcon = this.typeUsage.typeIcon
        this.getControllers();
    }

    private async getControllers() {
        try {
            const results = await this.api.get('?get=core_config_controllers');
            const setPackages = new Set<string>();
            for (let key in results) {
                if (key !== "apps") {
                    for (let controller of results[key]) {
                        const index = controller.lastIndexOf("_");
                        const pack = controller.substring(0, index).replace("_", ":");
                        const name = controller.substring(index + 1);
                        const apiUrl = "?" + (key === "actions" ? "do" : "get") + "=" + controller;
                        const controllerData = new ControllerData(controller, key, pack, name, apiUrl);

                        setPackages.add(pack);
                        this.controllers.push(controllerData);
                    }
                }
            }
            this.packages = Array.from(setPackages).sort();
            this.filterData = this.controllers;
        }
        catch (err: any) {
            console.warn('fetch controllers error', err);
        }
    }

    public onPackageChange(pack: string) {
        this.package = pack;
        this.onValueChange();
    }

    public onValueChange() {
        this.filterData = [];
        switch (this.searchType) {
            case "All":
                if (this.searchValue !== "") {
                    for (let controller of this.controllers) {
                        if (controller.pack.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
                            this.filterData.push(controller);
                        }
                    }
                }
                else {
                    this.filterData = this.controllers
                }
                break;
            case "Data":
                for (let controller of this.controllers) {
                    if (controller.type === "data") {
                        if (this.searchValue === "" || controller.pack.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
                            this.filterData.push(controller);
                        }
                    }
                }
                break;
            case "Actions":
                for (let controller of this.controllers) {
                    if (controller.type === "actions") {
                        if (this.searchValue === "" || controller.pack.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
                            this.filterData.push(controller);
                        }
                    }
                }
                break;
            default:
                for (let controller of this.controllers) {
                    if (controller.pack === this.package) {
                        this.filterData.push(controller);
                    }
                }
        }
    }

    add(value?: ControllerData) {
        this.addNode.emit(value);
    }

    close() {
        this.changeState.emit("");
    }

    openModalNameDescritpion() {
        const dialogRef = this.dialog.open(ModalNameDescriptionComponent, {
            width: '450px',
            height: '300px',
            data: { nodes: this.nodes, oldName: this.selectedNode?.name, name: this.selectedNode?.name, description: this.selectedNode?.description },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && this.selectedNode) {
                this.selectedNode.name = result.name;
                this.selectedNode.description = result.description;
                this.changePipeline.emit();
            }
        });
    }

    openModalInput(pair: any) {
        const dialogRef = this.dialog.open(ModalInputComponent, {
            width: '450px',
            height: '300px',
            data: { pair: pair, value: this.getParamValue(pair.key) },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateParamValue(pair.key, result);
                this.changePipeline.emit();
            }
        });
    }

    getParamValue(param: string): any {
        for (let parameter of this.parameters) {
            if (parameter.node === this.selectedNode && parameter.param === param) {
                return parameter.value;
            }
        }
        return undefined;
    }

    updateParamValue(param: string, value: any) {
        let isFound: boolean = false;
        for (let parameter of this.parameters) {
            if (parameter.node === this.selectedNode && parameter.param === param) {
                parameter.value = value;
                isFound = true;
            }
        }
        if (this.selectedNode && !isFound) {
            const parameter = new Parameter(this.selectedNode, param, value);
            this.parameters.push(parameter);
        }
    }

    deleteParam(param: string) {
        for (let i = 0; i < this.parameters.length; i++) {
            const parameter = this.parameters[i];
            if (parameter.node === this.selectedNode && parameter.param === param) {
                this.parameters.splice(i, 1);
                this.changePipeline.emit();
                break;
            }
        }
    }

    getValueLink(param: string): string {
        for (let link of this.links) {
            if (link.target === this.selectedNode && param === link.target_param) {
                return link.reference.name;
            }
        }
        return "";
    }

    getNodesSourceRouter(): Node[] {
        const res: Node[] = [];
        for (let link of this.links) {
            if (link.target === this.selectedNode) {
                res.push(link.reference);
            }
        }
        return res;
    }

    getLinks(): NodeLink[] {
        const res: NodeLink[] = [];
        for (let link of this.links) {
            if (this.selectedLink && link.source === this.selectedLink.source && link.target === this.selectedLink.target) {
                res.push(link);
            }
        }
        return res;
    }

    deleteParamAfterMapping(node: Node, param: string) {
        if (param !== "") {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i];
                if (parameter.node === node && parameter.param === param) {
                    this.parameters.splice(i, 1);
                    break;
                }
            }
        }
        this.changePipeline.emit();
    }

    isCompatible(reference: Node, targetParam: any): boolean {
        const refSchema = reference.data?.response?.schema;
        if (!refSchema || !targetParam) return false;

        return refSchema.type === targetParam.type;
    }



}