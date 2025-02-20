import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, Inject, OnChanges, OnInit, Optional } from '@angular/core';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';
import { WorkflowNode } from './_components/workflow-displayer/_objects/WorkflowNode';
import { Anchor, WorkflowLink } from './_components/workflow-displayer/_objects/WorkflowLink';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { WorkbenchV1Service } from 'src/app/in/_services/workbench-v1.service';
import { Location } from '@angular/common';

@Component({
  selector: 'package-model-workflow',
  templateUrl: './package-model-workflow.component.html',
  styleUrls: ['./package-model-workflow.component.scss']
})
export class PackageModelWorkflowComponent implements OnInit, OnChanges {
    private ngUnsubscribe = new Subject<void>();

    public models: string[] = [];
    public state: string = 'normal';
    public log = console.log;

    public nodes: WorkflowNode[] = [];
    public links: WorkflowLink[] = [];
    public selectedLink: number = -1;
    public selectedNode: number = -1;
    public package: string = "";
    public model: string = "";
    public model_scheme: any = {};
    public need_save: boolean = false;
    public selected_class: string = "";
    public tabIndex: number = 1;
    public color: { type: string, color: string }[] = [];
    public w = 10;
    public h = 10;
    public selected_classes: string[] = ["core\\User"];
    public test: { source: string, target: string, type: string }[] = [];
    public has_meta_data: number;
    public exists: boolean = false;
    public loading = true;

    constructor(
        private router: RouterMemory,
        private route: ActivatedRoute,
        private matDialog: MatDialog,
        private snackBar: MatSnackBar,
        private workbenchService: WorkbenchV1Service,
        private location: Location
    ) { }

    public async ngOnInit() {
        this.init();
    }

    private async init() {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
            this.package = params['package_name'];
            this.model = params['class_name'];
            this.loadWorkflow();
        });
    }

    /**
     * Charge le workflow, ajuste les positions pour être sûr qu'ils soient visibles,
     * puis met à jour les nœuds et les liens.
     */
    private async loadWorkflow() {
        const packageName = this.route.snapshot.paramMap.get('package_name')!;
        const model = this.route.snapshot.paramMap.get('class_name')!;

        console.log(`Chargement du workflow pour le package: ${packageName} et le modèle: ${model}`);
        this.workbenchService.getWorkflowData(packageName, model)
            .pipe(
                tap(data => console.log('Données de workflow reçues:', data))
            )
            .subscribe(data => {
                // Création des nœuds à partir des données
                let nodes: WorkflowNode[] = data.nodes.map((nodeData: any) => new WorkflowNode(
                    nodeData.name,
                    {
                        position: nodeData.position,
                        description: nodeData.description,
                        help: nodeData.help,
                        icon: nodeData.icon,
                    }
                ));

                // Calcul de l'offset afin de garantir que tous les nœuds soient visibles
                let minX = Math.min(...nodes.map(node => node.position.x));
                let minY = Math.min(...nodes.map(node => node.position.y));
                const offsetX = (minX < 200) ? (200 - minX) : 0;
                const offsetY = (minY < 200) ? (200 - minY) : 0;

                console.log(`Calcul des offsets: offsetX=${offsetX}, offsetY=${offsetY}`);
                nodes.forEach(node => {
                    node.position.x += offsetX;
                    node.position.y += offsetY;
                });

                this.nodes = nodes;
                this.links = data.links;
                this.exists = data.exists;
                this.model_scheme = data.modelScheme;
                this.loading = false;
                console.log('Workflow chargé avec succès.', { nodes: this.nodes, links: this.links });
            });
    }

    public reset() {
        this.init();
    }

    public changeState(state: string) {
        if (this.state !== state) {
            console.log(`Changement d'état de ${this.state} vers ${state}`);
            this.state = state;
            if (!["linking-to"].includes(this.state)) {
                this.selectedNode = -1;
            }
            if (!["edit-link", "edit-from", "edit-to"].includes(this.state)) {
                this.selectedLink = -1;
            }
        }
    }

    selectNode(index: number) {
        this.selectedNode = index;
        this.nodes.forEach((node, idx) => {
          node.icon = idx === index ? 'check_circle' : 'hub';
        });
    }

    private getNodeByName(name: string): WorkflowNode | null {
        return this.nodes.find(item => item.name === name) || null;
    }

    public ngOnChanges() {
        console.log("ngOnChanges appelé");
    }

    public deleteLink() {
        if (this.selectedLink >= 0) {
            this.links.splice(this.selectedLink, 1);
        }
        this.selectedLink = -1;
    }

    public deleteNode() {
        if (this.selectedNode >= 0) {
            const deleted = this.nodes.splice(this.selectedNode, 1);
            this.links = this.links.filter(link => link.from !== deleted[0] && link.to !== deleted[0]);
            this.selectedNode = -1;
        }
    }

    public dragoff(event: CdkDragEnd) {
        console.log('Drag ended:', event);
    }

    public requestLinkFrom() {
        if (!['linking-from', 'linking-to'].includes(this.state)) {
            this.changeState('linking-from');
        }
    }

    get sizeViewer(): number {
        switch (this.state) {
            case "normal":
            case "link-to":
            case "link-from":
                return 12;
            case "edit-link":
                return 8;
            default:
                return 9;
        }
    }

    get sizeEditor(): number {
        switch (this.state) {
            case "normal":
            case "link-to":
            case "link-from":
                return 0;
            case "edit-link":
                return 4;
            default:
                return 3;
        }
    }

    public goBack() {
        this.location.back();
    }

    /**
     * Exporte le workflow en générant un objet JSON contenant chaque nœud et ses transitions.
     */
    public export(): { [id: string]: any } {
        const result: { [id: string]: any } = {};
        for (let node of this.nodes) {
            result[node.name] = node.export();
            result[node.name].transitions = {};
            for (let link of this.links) {
                if (link.from === node) {
                    result[node.name].transitions[link.name] = link.export();
                }
            }
        }
        console.log('Workflow exporté:', result);
        return result;
    }

    /**
     * Exporte les méta-données du workflow.
     */
    public exportMetaData(): { [id: string]: any } {
        const result: { [id: string]: any } = {};
        for (let node of this.nodes) {
            result[node.name] = node.generateMetaData();
            result[node.name].transitions = {};
            for (let link of this.links) {
                if (link.from === node) {
                    result[node.name].transitions[link.name] = link.generateMetaData();
                }
            }
        }
        console.log('Méta-données exportées:', result);
        return result;
    }

    /**
     * Sauvegarde le workflow. S'il n'existe pas, il est créé, puis sauvegardé avec ses méta-données.
     */
    public save() {
        console.log('Début de la sauvegarde du workflow...');
        if (!this.exists) {
            this.workbenchService.createWorkflow(this.package, this.model).subscribe((create) => {
                if (!create) {
                    console.error("Erreur lors de la création du workflow.");
                    return;
                }
                this.saveWorkflowWithMetaData();
            });
        } else {
            this.saveWorkflowWithMetaData();
        }
    }

    /**
     * Sauvegarde le workflow et ses méta-données.
     */
    private saveWorkflowWithMetaData() {
        const workflowJSON = JSON.stringify(this.export());
        console.log('Envoi du workflow à sauvegarder:', workflowJSON);
        this.workbenchService.saveWorkflow(this.package, this.model, workflowJSON)
            .subscribe((ret) => {
                if (!ret) {
                    console.error("Erreur lors de la sauvegarde du workflow.");
                    return;
                }
                // Sauvegarde des méta-données
                if (this.has_meta_data) {
                    this.workbenchService.saveMetaData(this.has_meta_data, JSON.stringify(this.exportMetaData()))
                        .subscribe((result) => {
                            if (!result) {
                                console.error("Erreur lors de la sauvegarde des méta-données.");
                                return;
                            }
                            this.snackBar.open("Saved successfully", "INFO");
                        });
                } else {
                    this.workbenchService.createMetaData("workflow", `${this.package}.${this.model}`, JSON.stringify(this.exportMetaData()))
                        .subscribe((result) => {
                            if (!result) {
                                console.error("Erreur lors de la création des méta-données.");
                                return;
                            }
                            this.snackBar.open("Saved successfully", "INFO");
                        });
                }
            });
    }

    public showJSON() {
        this.matDialog.open(Jsonator, {
            data: this.export(),
            width: "70vw",
            height: "85vh"
        });
    }

    public showJSONMetaData() {
        this.matDialog.open(Jsonator, {
            data: this.exportMetaData(),
            width: "70vw",
            height: "85vh"
        });
    }

    public navigateToParent() {
        if (this.model_scheme.parent !== "model") {
            const parent_package = this.model_scheme.parent.split("\\")[0];
            const parent_model = this.model_scheme.parent.split("\\").slice(1).join("\\");
            this.router.navigate(['/package/' + parent_package + '/model/' + parent_model + '/workflow']);
        }
    }

    public customButtonBehavior(evt: string) {
        switch (evt) {
            case "Show JSON":
                this.showJSON();
                break;
            case "Show JSON meta data":
                this.showJSONMetaData();
                break;
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
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    get datajson() {
        return prettyPrintJson.toHtml(this.data);
    }
}
