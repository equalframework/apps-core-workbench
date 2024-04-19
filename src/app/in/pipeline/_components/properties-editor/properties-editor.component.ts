import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ControllerData } from '../../_objects/ControllerData';
import { Node } from '../../_objects/Node';
import { NodeLink } from '../../_objects/NodeLink';
import { Parameter } from '../../_objects/Parameter';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ModalInputComponent } from '../modal-input/modal-input.component';
import { KeyValue } from '@angular/common';

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

    @Input() parameters: Parameter[];

    public typeIcon: { [id: string]: string }

    public selectedParams: Parameter[] = [];

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
            const results = await this.api.fetch('?get=core_config_controllers');
            const set = new Set<string>();
            for (let key in results) {
                if (key !== "apps") {
                    for (let controller of results[key]) {
                        const index = controller.lastIndexOf("_");
                        const dirs = controller.substring(0, index).replace("_", ":");
                        const file = controller.substring(index + 1);
                        const url = "?" + (key === "actions" ? "do" : "get") + "=" + controller;
                        const x = new ControllerData(controller, key, dirs, file, url);

                        set.add(dirs);
                        this.controllers.push(x);
                    }
                }
            }
            this.packages = Array.from(set).sort();
            this.filterData = this.controllers;
        }
        catch (err: any) {
            console.warn('fetch class error', err);
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
                        if (controller.package.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
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
                        if (this.searchValue === "" || controller.package.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
                            this.filterData.push(controller);
                        }
                    }
                }
                break;
            case "Actions":
                for (let controller of this.controllers) {
                    if (controller.type === "actions") {
                        if (this.searchValue === "" || controller.package.includes(this.searchValue) || controller.name.includes(this.searchValue)) {
                            this.filterData.push(controller);
                        }
                    }
                }
                break;
            default:
                for (let controller of this.controllers) {
                    if (controller.package === this.package) {
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

    openModal(pair: any) {
        const dialogRef = this.dialog.open(ModalInputComponent, {
            width: '450px',
            height: '300px',
            data: { pair: pair, value: this.getParamsValue(pair.key) },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateParamsValue(result, pair.key)
            }
        });
    }

    getParamsValue(param: string): any {
        for (let parameter of this.parameters) {
            if (parameter.node === this.selectedNode && parameter.target === param) {
                return parameter.source;
            }
        }
        return undefined;
    }

    updateParamsValue(value: any, param: string) {
        let isFound: boolean = false;
        for (let parameter of this.parameters) {
            if (parameter.node === this.selectedNode && parameter.target === param) {
                parameter.source = value;
                isFound = true;
            }
        }
        if (this.selectedNode && !isFound) {
            const parameter = new Parameter(value, param);
            parameter.node = this.selectedNode;
            this.parameters.push(parameter);
        }
    }

    onSelectionChange(event: MatSelectChange, param?: Parameter) {
        if (param) {
            param.target = event.value;
            this.deleteParamNode(event.value);
        }
        else {
            for (let parameter of this.parameters) {
                if (this.selectedLink && parameter.link && parameter.link === this.selectedLink) {
                    parameter.target = event.value;
                    this.deleteParamNode(event.value);
                }
            }
        }
    }

    private deleteParamNode(target: string) {
        for (let i = 0; i < this.parameters.length; i++) {
            let parameter = this.parameters[i];
            if (parameter.node === this.selectedLink?.to && parameter.target === target) {
                this.parameters.splice(i, 1);
                break;
            }
        }
    }

    getTargetValue(): string {
        for (let parameter of this.parameters) {
            if (this.selectedLink && parameter.link && parameter.link === this.selectedLink) {
                return parameter.target;
            }
        }
        return "";
    }

    getParamsLink() {
        const res: Parameter[] = [];
        for (let parameter of this.parameters) {
            if (parameter.link && parameter.link === this.selectedLink) {
                res.push(parameter);
            }
        }
        return res;
    }

    getSourceLink(param: string): string {
        for (let parameter of this.parameters) {
            if (parameter.link && parameter.link.to === this.selectedNode && parameter.target === param) {
                return parameter.source;
            }
        }
        return "";
    }

    getControllerName(source: string, param?: string): string {
        if (this.selectedLink && !this.selectedLink.from.data) {
            for (let parameter of this.parameters) {
                if (parameter.link && parameter.target === source) {
                    return parameter.link.from.name;
                }
            }
        } else {
            for (let parameter of this.parameters) {
                if (parameter.link && parameter.link.to === this.selectedNode && parameter.target === param) {
                    if (parameter.link.from.data) {
                        return parameter.link.from.name;
                    } else {
                        for (let parameter of this.parameters) {
                            if (parameter.link && parameter.target === source) {
                                return parameter.link.from.name;
                            }
                        }
                    }
                }
            }
        }
        return "";
    }
}