import { Component } from '@angular/core';
import { Node } from './_objects/Node';
import { ControllerData } from './_objects/ControllerData';
import { ApiService } from 'sb-shared-lib';
import { NodeLink } from './_objects/NodeLink';
import { Parameter } from './_objects/Parameter';
import { MatDialog } from '@angular/material/dialog';
import { PipelineLoaderComponent } from './_components/pipeline-loader/pipeline-loader.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalExecutionPipelineComponent } from './_components/modal-execution-pipeline/modal-execution-pipeline.component';
import { ExplorerDialogComponent } from 'src/app/_dialogs/explorer-dialog/explorer-dialog.component';

@Component({
    selector: 'app-pipeline',
    templateUrl: './pipeline.component.html',
    styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {
    public pipelineId: number = -1;

    isLoading:boolean = false;
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

    public isRunnable: boolean = false;

    constructor(
        private api: ApiService,
        private dialog: MatDialog,
        private matSnack: MatSnackBar
    ) { }

    newFile() {
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
        this.isRunnable = false;
    }

    async load() {
        try {
            // Optional: Show loading spinner

            // Step 1: Fetch available pipelines
            const res: { name: string, id: number }[] = await this.api.collect("core\\pipeline\\Pipeline", [], ['name']);
            const pipelines = res.map(p => p.name);
            const pipelineMap = new Map<string, number>(res.map(p => [p.name, p.id]));

            // Step 2: Show dialog for user to select a pipeline
            const dialogRef = this.dialog.open(PipelineLoaderComponent, {
                width: "60vw",
                maxWidth: "600px",
                data: { pipeline: "", pipelines }
            });

            dialogRef.afterClosed().subscribe(async selectedName => {
                if (!selectedName || !pipelineMap.has(selectedName)) return;

                // Step 3: Load full pipeline by name
                const fullPipeline = await this.api.call(`?get=model_pipeline-load&name=${selectedName}`);

                // Step 4: Reset current state
                this.newFile();
                this.pipelineId = fullPipeline.pipeline.id;
                this.pipelineName = selectedName;

                const nodesMap = new Map<number, Node>();

                // Step 5: Create nodes (parallel controller fetch)
                const nodePromises = fullPipeline.nodes.map(async (nodeData: any) => {
                    const node = new Node(nodeData.meta.position);
                    node.id = nodeData.id;
                    node.name = nodeData.name;
                    node.description = nodeData.description;
                    node.color = nodeData.meta.color;
                    node.icon = nodeData.meta.icon;

                    if (nodeData.operation_controller) {
                        const index = nodeData.operation_controller.lastIndexOf("_");
                        const pack = nodeData.operation_controller.substring(0, index).replace("_", ":");
                        const name = nodeData.operation_controller.substring(index + 1);
                        const apiUrl = "?" + nodeData.operation_type + "=" + nodeData.operation_controller;

                        const info = (await this.api.fetch(apiUrl + '&announce=true')).announcement;

                        const controllerData = new ControllerData(
                            nodeData.operation_controller,
                            nodeData.operation_type === "get" ? "data" : "actions",
                            pack,
                            name,
                            apiUrl
                        );
                        controllerData.description = info.description;
                        controllerData.params = info.params;
                        controllerData.response = info.response;

                        node.data = controllerData;
                    }

                    nodesMap.set(node.id, node);
                    return node;
                });
                this.isLoading = true;
                this.nodes = await Promise.all(nodePromises);

                // Step 6: Create links
                for (const link of fullPipeline.links) {
                    const reference = nodesMap.get(link.reference_node_id);
                    const source = nodesMap.get(link.source_node_id);
                    const target = nodesMap.get(link.target_node_id);

                    if (reference && source && target) {
                        const nodeLink = new NodeLink(reference, source, target);
                        nodeLink.id = link.id;
                        nodeLink.target_param = link.target_param;
                        this.links.push(nodeLink);
                    }
                }

                // Step 7: Create parameters
                for (const param of fullPipeline.parameters) {
                    const node = nodesMap.get(param.node_id);
                    if (node) {
                        const parameter = new Parameter(node, param.param, param.value);
                        parameter.id = param.id;
                        this.parameters.push(parameter);
                    }
                }

                this.isRunnable = true;
                this.matSnack.open("Loaded successfully!", "INFO");
                this.isLoading = false;
            });
        } catch (e) {
            this.api.errorFeedback(e);
        } finally {
            this.isLoading = false;
        }
    }


    async save() {
        try {
            if (this.pipelineId == -1) {
                this.pipelineId = (await this.api.create("core\\pipeline\\Pipeline", { name: this.pipelineName })).id;
            } else {
                await this.api.update("core\\pipeline\\Pipeline", [this.pipelineId], { name: this.pipelineName });
            }
            for (let node of this.nodes) {
                const metaValue: string = JSON.stringify({ position: node.updatedPosition, icon: node.icon, color: node.color });
                if (node.id) {
                    const metaId = (await this.api.collect("core\\Meta", [['reference', '=', `node.${node.id}`]], ['id']))[0].id;
                    await this.api.update("core\\Meta", [metaId], { value: metaValue });
                    await this.api.update("core\\pipeline\\Node", [node.id], { name: node.name, description: node.description })
                } else {
                    if (node.data) {
                        node.id = (await this.api.create("core\\pipeline\\Node", { name: node.name, description: node.description, pipeline_id: this.pipelineId, operation_controller: node.data.fullName, operation_type: node.data.type === "data" ? "get" : "do" })).id;
                    } else {
                        node.id = (await this.api.create("core\\pipeline\\Node", { name: node.name, pipeline_id: this.pipelineId })).id;
                    }
                    await this.api.create("core\\Meta", { code: "pipeline", reference: `node.${node.id}`, value: metaValue });
                }
            }
            for (let link of this.links) {
                if (link.id) {
                    await this.api.update("core\\pipeline\\NodeLink", [link.id], { target_param: link.target_param });
                }
                else {
                    link.id = (await this.api.create("core\\pipeline\\NodeLink", { reference_node_id: link.reference.id, source_node_id: link.source.id, target_node_id: link.target.id, target_param: link.target_param })).id;
                }
            }
            for (let parameter of this.parameters) {
                const valueJson = JSON.stringify(parameter.value);
                if (parameter.id) {
                    await this.api.update("core\\pipeline\\Parameter", [parameter.id], { value: valueJson, param: parameter.param });
                }
                else {
                    parameter.id = (await this.api.create("core\\pipeline\\Parameter", { node_id: parameter.node.id, value: valueJson, param: parameter.param })).id;
                }
            }

            if (this.deletedNodeIds.length !== 0) {
                const deletedMetaIds: number[] = [];
                for (let nodeId of this.deletedNodeIds) {
                    const metaId = (await this.api.collect("core\\Meta", [['reference', '=', 'node.' + nodeId]], ['id']))[0].id;
                    deletedMetaIds.push(metaId);
                }
                await this.api.remove("core\\Meta", deletedMetaIds, true);
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

            this.isRunnable = true;

            this.matSnack.open("Saved successfully !", "INFO");
        }
        catch (e) {
            this.api.errorFeedback(e);
        }
    }

    async run() {
        const dialogRef = this.dialog.open(ModalExecutionPipelineComponent, {
            width: '80%',
            height: '80%',
            data: { pipelineName: this.pipelineName, pipelineId: this.pipelineId },
        });
    }

    get sizeViewer(): number {
        return (this.state === "add" || this.state === "edit") ? 8 : 12;
    }

    get sizeEditor(): number {
        return (this.state === "add" || this.state === "edit") ? 4 : 0;
    }

    changeState(state: string) {
        if (state === "" || state === "add") {
            if (this.selectedLink) {
                this.selectedLink.isSelected = false;
                this.selectedLink = undefined;
            }
            if (this.selectedNode) {
                this.selectedNode.isSelected = false;
                this.selectedNode = undefined;
            }
        }
        this.state = state;
    }

    async addNode(controllerData?: ControllerData) {
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
        if (controllerData) {
            try {
                const info = (await this.api.fetch(controllerData.apiUrl + '&announce=true')).announcement;
                controllerData.description = info.description;
                controllerData.params = info.params;
                controllerData.response = info.response;

                node.data = controllerData;
                node.name = this.checkName(controllerData.name);
                node.icon = controllerData.type === "actions" ? "open_in_browser" : "data_array";
                node.color = controllerData.type === "actions" ? "lightcoral" : "beige";

                this.nodes.push(node);
                this.isRunnable = false;
            }
            catch (e) {
                this.api.errorFeedback(e);
            }
        }
        else {
            node.name = this.checkName("router");
            node.icon = "filter_tilt_shift";
            node.color = "whitesmoke";
            this.nodes.push(node);
            this.isRunnable = false;
        }
    }

    private checkName(name: string): string {
        let newName: string = name;
        let suffix: number = 1;
        while (this.nodes.some(node => node.name === newName)) {
            newName = name + suffix;
            suffix++;
        }
        return newName;
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

        for (let i = 0; i < this.links.length; i++) {
            const link = this.links[i];
            if (link.source === node || link.target === node) {
                this.deleteLink(link);
                i = -1;
            }
        }

        this.deletedNodeIds.push(node.id);

        this.isRunnable = false;
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
        this.changeState("edit");
    }

    addLink(value: { source: Node, target: Node }) {
        const source = value.source;
        const target = value.target;

        if (!source.data && !target.data) {
            return
        }

        for (let link of this.links) {
            if ((link.source === source && link.target === target)
                || (link.source === target && link.target === source)
                || (link.target === target && target.data)) {
                return;
            }
        }

        if (!source.data) {
            for (let i = this.links.length - 1; i >= 0; i--) {
                const link = this.links[i];
                if (link.target === source) {
                    const newLink = new NodeLink(link.source, source, target);
                    this.links.push(newLink);
                    this.isRunnable = false;
                }
            }
        }
        else {
            const link = new NodeLink(source, source, target);
            this.links.push(link);
            this.isRunnable = false;

            if (!target.data) {
                for (let i = this.links.length - 1; i >= 0; i--) {
                    const link = this.links[i];
                    if (link.source === target) {
                        const newLink = new NodeLink(source, link.source, link.target);
                        this.links.push(newLink);
                    }
                }
            }
        }
    }

    deleteLink(link: NodeLink) {
        for (let i = this.links.length - 1; i >= 0; i--) {
            const link2 = this.links[i];
            if (link === link2) {
                this.links.splice(i, 1);
                this.deletedLinkIds.push(link2.id);
            }
            else if (!link.source.data && link.source === link2.source && link.target === link2.target) {
                this.links.splice(i, 1);
                this.deletedLinkIds.push(link2.id);
            }
            else if (!link.target.data && link.target === link2.source && link.source === link2.reference) {
                this.links.splice(i, 1);
                this.deletedLinkIds.push(link2.id);
            }
        }

        this.selectedLink = undefined;
        this.state = "";
        this.isRunnable = false;
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
        this.changeState("edit");
    }
}