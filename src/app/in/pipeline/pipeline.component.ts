import { Component } from '@angular/core';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { Node } from './_objects/Node';
import { ControllerData } from './_objects/ControllerData';
import { ApiService } from 'sb-shared-lib';
import { NodeLink } from './_objects/NodeLink';
import { Parameter } from './_objects/Parameter';
import { MatDialog } from '@angular/material/dialog';
import { PipelineLoaderComponent } from './_components/pipeline-loader/pipeline-loader.component';

@Component({
    selector: 'app-pipeline',
    templateUrl: './pipeline.component.html',
    styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {
    public pipelineId: number = -1;

    public pipelineName: string = 'New Pipeline';

    public state: string = 'view';

    public nodes: Node[] = [];

    public view_offset: { x: number, y: number } = { x: 0, y: 0 };

    public selectedNode: Node | undefined;

    public links: NodeLink[] = [];

    public selectedLink: NodeLink | undefined;

    public parameters: Parameter[] = [];

    public deletedNodeIds: number[] = [];

    public deletedLinkIds: number[] = [];

    public deletedParamIds: number[] = [];

    constructor(
        private router: RouterMemory,
        private api: ApiService,
        private dialog: MatDialog
    ) { }

    public goBack() {
        this.router.goBack()
    }

    public newFile() {
        this.pipelineId = -1;
        this.pipelineName = 'New Pipeline';
        this.state = "view";
        this.nodes = [];
        this.view_offset = { x: 0, y: 0 };
        this.selectedNode = undefined;
        this.links = [];
        this.selectedLink = undefined;
        this.parameters = [];
        this.deletedNodeIds = [];
        this.deletedLinkIds = [];
        this.deletedParamIds = [];
    }

    async load() {
        const res: { name: string, id: number, nodes_ids: string[] }[] = await this.api.collect("core\\pipeline\\Pipeline", [], ['name', 'nodes_ids']);
        const pipelines: string[] = [];
        const pipelineMap: { [name: string]: { id: number, nodes_ids: string[] } } = {};

        for (let r of res) {
            pipelines.push(r.name);
            pipelineMap[r.name] = { id: r.id, nodes_ids: r.nodes_ids };
        }

        const dialogRef = this.dialog.open(PipelineLoaderComponent, {
            width: '450px',
            height: '250px',
            data: { pipeline: "", pipelines: pipelines },
        });

        dialogRef.afterClosed().subscribe(async result => {
            const pipeline = pipelineMap[result];
            if (pipeline) {
                this.newFile();
                this.pipelineId = pipeline.id;
                this.pipelineName = result;
                const links_ids: Set<string> = new Set<string>();
                const params_ids: Set<string> = new Set<string>();
                for (let nodeId of pipeline.nodes_ids) {
                    const valueNode: { id: number, name: string, out_links_ids: string[], in_links_ids: string[], node_type: string, controller: string, operation_type: string, params_ids: string[] } = (await this.api.collect("core\\pipeline\\Node", [['id', '=', nodeId]], ['id', 'name', 'out_links_ids', 'in_links_ids', 'node_type', 'controller', 'operation_type', 'params_ids']))[0];
                    const metaNode: { position: { x: number, y: number }, icon: string, color: string } = JSON.parse((await this.api.collect("core\\Meta", [['reference', '=', 'node.' + nodeId]], ['value']))[0].value);

                    const node: Node = new Node(metaNode.position);
                    node.id = valueNode.id;
                    node.color = metaNode.color;
                    node.icon = metaNode.icon;
                    node.name = valueNode.name;

                    if (valueNode.node_type === "controller") {
                        const index = valueNode.controller.lastIndexOf("_");
                        const dirs = valueNode.controller.substring(0, index).replace("_", ":");
                        const file = valueNode.controller.substring(index + 1);
                        const url = "?" + valueNode.operation_type + "=" + valueNode.controller;
                        const controllerData: ControllerData = new ControllerData(valueNode.controller, (valueNode.operation_type === "get") ? "data" : "actions", dirs, file, url);

                        const info = (await this.api.fetch(url + '&announce=true')).announcement;
                        controllerData.description = info.description;
                        controllerData.params = info.params;
                        controllerData.response = info.response;

                        node.data = controllerData;
                    }

                    this.nodes.push(node);

                    for (let link_id of valueNode.in_links_ids) {
                        links_ids.add(link_id);
                    }
                    for (let link_id of valueNode.out_links_ids) {
                        links_ids.add(link_id);
                    }
                    // why valueNode.params_ids is undefined ??
                    /*for (let param_id of valueNode.params_ids) {
                        params_ids.add(param_id);
                    }*/
                }

                for (let link_id of links_ids) {
                    const valueLink: { id: number, source_node_id: number, target_node_id: number, params_ids: string[] } = (await this.api.collect("core\\pipeline\\NodeLink", [['id', '=', link_id]], ['id', 'source_node_id', 'target_node_id', 'params_ids']))[0];
                    let nodeSource: Node | undefined = undefined;
                    let nodeTarget: Node | undefined = undefined;
                    for (let node of this.nodes) {
                        if (node.id === valueLink.source_node_id) {
                            nodeSource = node;
                        }
                        if (node.id === valueLink.target_node_id) {
                            nodeTarget = node;
                        }
                    }

                    if (nodeSource && nodeTarget) {
                        const link: NodeLink = new NodeLink(nodeSource, nodeTarget);
                        link.id = valueLink.id;
                        this.links.push(link);
                    }

                    for (let param_id of valueLink.params_ids) {
                        params_ids.add(param_id);
                    }
                }

                for (let param_id of params_ids) {
                    const valueParam: { id: number, node_link_id: number, node_id: number, source: string, target: string } = (await this.api.collect("core\\pipeline\\Parameter", [['id', '=', param_id]], ['id', 'node_link_id', 'node_id', 'source', 'target']))[0];
                    const source: any = JSON.parse(valueParam.source);
                    const parameter: Parameter = new Parameter(source, valueParam.target);
                    parameter.id = valueParam.id;
                    if (valueParam.node_id) {
                        for (let node of this.nodes) {
                            if (node.id === valueParam.node_id) {
                                parameter.node = node;
                                break;
                            }
                        }
                    }
                    else {
                        for (let link of this.links) {
                            if (link.id === valueParam.node_link_id) {
                                parameter.link = link;
                                break;
                            }
                        }
                    }
                    this.parameters.push(parameter);
                }
            }
        });
    }

    async save() {
        if (this.pipelineId == -1) {
            this.pipelineId = (await this.api.create("core\\pipeline\\Pipeline", { name: this.pipelineName })).id;
        } else {
            await this.api.update("core\\pipeline\\Pipeline", [this.pipelineId], { name: this.pipelineName });
        }
        for (let node of this.nodes) {
            if (node.id) {
                await this.api.update("core\\pipeline\\Node", [node.id], { name: node.name });

                const value: string = JSON.stringify({ position: node.updatedPosition, icon: node.icon, color: node.color });
                const metaId = (await this.api.collect("core\\Meta", [['reference', '=', `node.${node.id}`]], ['id']))[0].id;
                await this.api.update("core\\Meta", [metaId], { value: value });
            } else {
                if (node.data) {
                    node.id = (await this.api.create("core\\pipeline\\Node", { name: node.name, pipeline_id: this.pipelineId, node_type: "controller", controller: node.data.fullName, operation_type: node.data.type === "data" ? "get" : "do" })).id;
                } else {
                    node.id = (await this.api.create("core\\pipeline\\Node", { name: "router", pipeline_id: this.pipelineId, node_type: "router" })).id;
                }
                const value: string = JSON.stringify({ position: node.updatedPosition, icon: node.icon, color: node.color });
                await this.api.create("core\\Meta", { code: "pipeline", reference: `node.${node.id}`, value: value });
            }
        }
        for (let link of this.links) {
            if (!link.id) {
                link.id = (await this.api.create("core\\pipeline\\NodeLink", { source_node_id: link.from.id, target_node_id: link.to.id })).id;
            }
        }
        for (let parameter of this.parameters) {
            const sourceJson = JSON.stringify(parameter.source);
            if (!parameter.id) {
                if (parameter.node) {
                    parameter.id = (await this.api.create("core\\pipeline\\Parameter", { node_id: parameter.node.id, source: sourceJson, target: parameter.target })).id;
                }
                else {
                    parameter.id = (await this.api.create("core\\pipeline\\Parameter", { node_link_id: parameter.link.id, source: sourceJson, target: parameter.target })).id;
                }
            }
            else {
                await this.api.update("core\\pipeline\\Parameter", [parameter.id], { source: sourceJson, target: parameter.target });
            }
        }

        if (this.deletedNodeIds.length !== 0) {
            await this.api.remove("core\\pipeline\\Node", this.deletedNodeIds, true);
            this.deletedNodeIds = [];
        }
        if (this.deletedLinkIds.length !== 0) {
            await this.api.remove("core\\pipeline\\NodeLink", this.deletedLinkIds, true);
            this.deletedLinkIds = [];
        }
        if (this.deletedParamIds.length !== 0) {
            await this.api.remove("core\\pipeline\\Parameter", this.deletedParamIds, true);
            this.deletedParamIds = [];
        }
    }

    get sizeViewer(): number {
        return (this.state === "add" || this.state === "edit") ? 8 : 12;
    }

    get sizeEditor(): number {
        return (this.state === "add" || this.state === "edit") ? 4 : 0;
    }

    changeState(state: string) {
        this.state = state;
    }

    async addNode(data?: ControllerData) {
        const position = { x: -this.view_offset.x + 100, y: -this.view_offset.y + 100 }
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].updatedPosition.x >= position.x - 50
                && this.nodes[i].updatedPosition.x <= position.x + 50
                && this.nodes[i].updatedPosition.y >= position.y - 50
                && this.nodes[i].updatedPosition.y <= position.y + 50) {
                position.x += 100;
                position.y += 100;
                i = -1;
            }
        }
        const node: Node = new Node(position);
        if (data) {
            const info = (await this.api.fetch(data.url + '&announce=true')).announcement;
            data.description = info.description;
            data.params = info.params;
            data.response = info.response;

            node.data = data;
            node.name = data.name;
            if (data.type === "actions") {
                node.icon = "open_in_browser";
                node.color = "lightcoral";
            }
            else {
                node.icon = "data_array";
                node.color = "beige";
            }
        }
        else {
            node.icon = "filter_tilt_shift";
            node.color = "whitesmoke";
        }

        this.nodes.push(node);
    }

    deleteNode(node: Node) {
        const index = this.nodes.findIndex(n => n === node);

        this.nodes.splice(index, 1);

        for (let i = this.parameters.length - 1; i >= 0; i--) {
            if (this.parameters[i].node === node) {
                this.deletedParamIds.push(this.parameters[i].id);
                this.parameters.splice(i, 1);
            }
        }

        this.selectedNode = undefined;

        this.state = "";

        for (let i = this.links.length - 1; i >= 0; i--) {
            const link = this.links[i];
            if (link.from === node || link.to === node) {
                this.deleteLink(link);
            }
        }

        this.deletedNodeIds.push(node.id);
    }

    editNode(node: Node) {
        if (this.selectedLink) {
            this.selectedLink.isSelected = false;
            this.selectedLink = undefined;
        }
        else if (this.selectedNode && this.selectedNode !== node) {
            this.selectedNode.isSelected = false;
        }
        node.isSelected = true;
        this.selectedNode = node;
        node.data ? this.changeState("edit") : this.changeState("");
    }

    addLink(value: { nodeFrom: Node, nodeTo: Node }) {
        const nodeFrom = value.nodeFrom;
        const nodeTo = value.nodeTo;

        if (!nodeFrom.data && !nodeTo.data) {
            return
        }

        for (let link of this.links) {
            if ((link.from === nodeFrom && link.to === nodeTo)
                || (link.from === nodeTo && link.to === nodeFrom)
                || (nodeTo === link.to && nodeTo.data)) {
                return;
            }
        }
        const link = new NodeLink(nodeFrom, nodeTo);
        this.links.push(link);

        if (nodeFrom.data) {
            const name = nodeFrom.data.response.schema.name;
            const parameter = new Parameter(name, "");
            if (!nodeTo.data) {
                let fullName = name;
                let occurrenceCount = 2;
                let existingParameter = this.parameters.find(parameter => parameter.target.includes(name));
                while (existingParameter) {
                    fullName = name + " " + occurrenceCount;
                    occurrenceCount++;
                    existingParameter = this.parameters.find(parameter => parameter.target.includes(fullName));
                }
                parameter.target = fullName;
                for (let link of this.links) {
                    if (link.from === nodeTo) {
                        const parameter2 = new Parameter(fullName, "");
                        parameter2.link = link;
                        this.parameters.push(parameter2);
                    }
                }
            }
            parameter.link = link;
            this.parameters.push(parameter);
        } else {
            for (let parameter of this.parameters) {
                if (parameter.link && parameter.link.to === nodeFrom) {
                    const param = new Parameter(parameter.target, "");
                    param.link = link;
                    this.parameters.push(param);
                }
            }
        }
    }

    editLink(link: NodeLink) {
        if (this.selectedNode) {
            this.selectedNode.isSelected = false;
            this.selectedNode = undefined;
        }
        else if (this.selectedLink && this.selectedLink !== link) {
            this.selectedLink.isSelected = false;
        }
        link.isSelected = true;
        this.selectedLink = link;
        link.to.data ? this.changeState("edit") : this.changeState("");
    }

    deleteLink(link: NodeLink) {
        const index = this.links.findIndex(l => l === link);

        this.links.splice(index, 1);

        for (let i = this.parameters.length - 1; i >= 0; i--) {
            const parameter = this.parameters[i];
            if (parameter.link && parameter.link === link) {
                if (!link.to.data) {
                    for (let j = this.parameters.length - 1; j >= 0; j--) {
                        const parameter2 = this.parameters[j];
                        if (parameter2.link && parameter2.link.from === link.to && parameter2.source === parameter.target) {
                            this.deletedParamIds.push(this.parameters[j].id);
                            this.parameters.splice(j, 1);
                        }
                    }
                }
                this.deletedParamIds.push(this.parameters[i].id);
                this.parameters.splice(i, 1);
            }
        }
        this.selectedLink = undefined;

        this.state = "";

        this.deletedLinkIds.push(link.id);
    }
}