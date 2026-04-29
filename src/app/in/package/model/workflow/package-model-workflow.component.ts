import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, Injector, OnChanges, OnInit, Optional } from '@angular/core';

import { WorkflowNode } from './_components/workflow-displayer/_objects/WorkflowNode';
import { Anchor, WorkflowLink, test } from './_components/workflow-displayer/_objects/WorkflowLink';
import { cloneDeep } from 'lodash';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';
import { JsonValidationService } from 'src/app/in/_services/json-validation.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
    selector: 'app-package-model-workflow',
    templateUrl: './package-model-workflow.component.html',
    styleUrls: ['./package-model-workflow.component.scss']
})
export class PackageModelWorkflowComponent implements OnInit, OnChanges {

    private ngUnsubscribe = new Subject<void>();

    public models: string[] = [];
    public state = 'normal';


    public nodes: WorkflowNode[] = [];
    public links: WorkflowLink[] = [];
    public selectedLink = -1;
    public selectedNode = -1;
    public package = '';
    public model = '';
    public modelScheme: any = {};
    public needSave = false;
    public selectedClass = '';
    public tabIndex = 1;
    public isSaving = false;

    public color: { type: string, color: string }[] = [];
    public w = 10;
    public h = 10;

    public selectedClasses: string[] = ['core\\User'];
    private backgroundPreloadStarted = false;

    public test: { source: string, target: string, type: string }[] = [];
    public hasMetaData: number;
    public exists = false;

    public loading = true;

    private readonly debugPrefix = '[PackageModelWorkflow]';

    constructor(
        private workbenchService: WorkbenchService,
        private router: RouterMemory,
        private route: ActivatedRoute,
        private matDialog: MatDialog,
        private snackBar: MatSnackBar,
        private location: Location,
        private jsonValidationService: JsonValidationService,
        private provider: EqualComponentsProviderService,
        private injector: Injector,
    ) { }

    public async ngOnInit(): Promise<void> {
        this.init();
    }

    private async init(): Promise<void> {
        this.loading = true;
        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
            this.package = params['package_name'];
            this.model = params['class_name'];

            await this.loadWorkflow();
            void this.fetchBackgroundData();
        });
    }

        private async fetchBackgroundData(): Promise<void> {
            if (this.backgroundPreloadStarted) {
                return;
            }

            this.backgroundPreloadStarted = true;

            try {
                // Lazy-resolve provider so its constructor-triggered preload starts only in phase 3.
                if (!this.provider) {
                    this.provider = this.injector.get(EqualComponentsProviderService);
                }
            } catch (err) {
                console.error('Error during background data fetching', err);
            }
        }

    private async loadWorkflow(): Promise<void> {
        this.loading = true;
        this.nodes = [];
        this.links = [];
        this.needSave = false;

        try {
            const r = await this.workbenchService.getWorkflow(this.package, this.model).toPromise();

            if (r.exists !== null && r.exists !== undefined) {
                this.exists = r.exists;
                const metadata = await this.workbenchService.fetchMetaData('workflow', this.package + '.' + this.model).toPromise();
                this.hasMetaData = Object.keys(metadata).length > 0 ? metadata[0].id : undefined;
                this.modelScheme = await this.workbenchService.getSchema(this.package + '\\' + this.model).toPromise();
                const res = r.info;
                const orig = { x: 200, y: 200 };
                let mdt: any = {};

                if (this.hasMetaData) {
                    try {
                        mdt = JSON.parse(metadata[0].value);
                    } catch (error) {
                        console.error(`${this.debugPrefix} invalid metadata JSON`, error);
                        mdt = {};
                    }
                }

                let offsetX = 0;
                let offsetY = 0;
                let isFirst = true;
                for (const node in res) {
                    const pos = (!this.hasMetaData || !mdt || !mdt[node] || !mdt[node].position) ? cloneDeep(orig) : mdt[node].position;
                    if (isFirst && pos.x < 200) {
                        offsetX = -pos.x + 200;
                    }
                    if (isFirst && pos.y < 200) {
                        offsetY = -pos.y + 200;
                    }
                    pos.x += offsetX;
                    pos.y += offsetY;
                    this.nodes.push(new WorkflowNode(node, {
                        description: res[node].description,
                        position: pos,
                        help: res[node].help,
                        icon: res[node].icon
                    })
                    );
                    orig.y += 100;
                    orig.x += 100;
                    isFirst = false;
                }
                for (const node in res) {
                    for (const link in res[node].transitions) {
                        const a = this.getNodeByName(node);
                        let b = this.getNodeByName(res[node].transitions[link].status);

                        if (!b) {
                            b = new WorkflowNode(res[node].transitions[link].status, { position: cloneDeep(orig) });
                            this.nodes.push(b);
                            orig.y += 100;
                            orig.x += 100;
                            this.needSave = true;
                            console.warn(`${this.debugPrefix} transition references missing node, auto-created`, {
                                from: node,
                                to: res[node].transitions[link].status,
                                transition: link
                            });
                        }
                        if (a && b) {
                            const anchor1 = (!this.hasMetaData || !mdt || !mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] || !mdt[a.name].transitions[link].anchorFrom)
                                ? Anchor.MiddleRight
                                : mdt[a.name].transitions[link].anchorFrom;
                            const anchor2 = (!this.hasMetaData || !mdt || !mdt[a.name] || !mdt[a.name].transitions || !mdt[a.name].transitions[link] || !mdt[a.name].transitions[link].anchorFrom)
                                ? Anchor.MiddleLeft
                                : mdt[a.name].transitions[link].anchorTo;
                            this.links.push(
                                new WorkflowLink(a, b, anchor1, anchor2, Object.assign(res[node].transitions[link], { name: link }))
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`${this.debugPrefix} loadWorkflow() failed`, error);
        } finally {
            this.loading = false;
        }
    }

    public reset(): void {
        this.init();
    }

    public changeState(state: string): void {
        if (this.state !== state) {
            this.state = state;
            if (!['linking-to'].includes(this.state)) {
                this.selectedNode = -1;
            }
            if (this.state.includes('linked-failed')) {
                this.selectedNode = -1;
                this.snackBar.open('Link already existing');
            }
            if (!['edit-link', 'edit-from', 'edit-to'].includes(this.state)) {
                this.selectedLink = -1;
            }
        }
    }

    selectNode(index: number): void {
        this.selectedNode = index;
        this.nodes.forEach((node, idx) => {
            node.icon = idx === index ? 'check_circle' : 'hub';
        });
    }

    private getNodeByName(name: string): WorkflowNode | null {
        return this.nodes.find(item => item.name === name) || null;
    }

    public ngOnChanges(): void {
    }

    public deleteLink(): void {
        if (this.selectedLink >= 0) {
            this.links.splice(this.selectedLink, 1);
        }
        this.selectedLink = -1;
    }

    public deleteNode(): void {
        if (this.selectedNode >= 0) {
            const deleted = this.nodes.splice(this.selectedNode, 1);
            this.links = this.links.filter(link => link.from !== deleted[0] && link.to !== deleted[0]);
            this.selectedNode = -1;
        }
    }

    public dragOff(event: CdkDragEnd): void {
    }

    public requestLinkFrom(): void {
        if (!['linking-from', 'linking-to'].includes(this.state)) {
            this.changeState('linking-from');
        }
    }

    get sizeViewer(): number {
        switch (this.state) {
            case 'normal':
            case 'link-to':
            case 'link-from':
                return 12;
            case 'edit-link':
                return 8;
            default:
                return 9;
        }
    }

    get sizeEditor(): number {
        switch (this.state) {
            case 'normal':
            case 'link-to':
            case 'link-from':
                return 0;
            case 'edit-link':
                return 4;
            default:
                return 3;
        }
    }

    public goBack(): void {
        this.location.back();
    }

    public export(): any {
        const result: {[id: string]: any} = {};
        for (const node of this.nodes) {
            result[node.name] = node.export();
            result[node.name].transitions = {};
        }

        for (const link of this.links) {
            const fromNodeName = this.getNodeName(link?.from);
            if (!fromNodeName || !result[fromNodeName]) {
                continue;
            }

            const transitionName = this.getUniqueTransitionName(
                result[fromNodeName].transitions,
                link?.name
            );
            result[fromNodeName].transitions[transitionName] = link.export();
        }
        return result;
    }

    public exportMetaData(): any {
        const result: {[id: string]: any} = {};
        for (const node of this.nodes) {
            result[node.name] = node.generateMetaData();
            result[node.name].transitions = {};
        }

        for (const link of this.links) {
            const fromNodeName = this.getNodeName(link?.from);
            if (!fromNodeName || !result[fromNodeName]) {
                continue;
            }

            const transitionName = this.getUniqueTransitionName(
                result[fromNodeName].transitions,
                link?.name
            );
            result[fromNodeName].transitions[transitionName] = link.generateMetaData();
        }
        return result;
    }

    private getNodeName(node: WorkflowNode | null | undefined): string {
        return node?.name || '';
    }

    private getUniqueTransitionName(existingTransitions: { [id: string]: any }, requestedName: string | null | undefined): string {
        const baseName = (requestedName || 'transition').trim() || 'transition';

        if (!existingTransitions[baseName]) {
            return baseName;
        }

        let index = 2;
        let candidate = `${baseName}_${index}`;
        while (existingTransitions[candidate]) {
            index += 1;
            candidate = `${baseName}_${index}`;
        }

        return candidate;
    }


    public save(): void {

        if (!this.exists) {
            this.workbenchService.createWorkflow(this.package, this.model).subscribe((create) => {
                if (!create) {
                    console.error('Error while creating the workflow.');
                    return;
                }
                this.saveWorkflowWithMetaData();
            });
        } else {
            this.saveWorkflowWithMetaData();
        }
    }

    private async saveWorkflowWithMetaData(): Promise<void> {
        const workflowPayload = this.export();
        const workflowJSON = JSON.stringify(workflowPayload);
        const metadataJSON = JSON.stringify(this.exportMetaData());
        let modelPayloadForValidation: any;
        try {
            modelPayloadForValidation = await this.buildModelPayloadWithWorkflow(workflowPayload);
        } catch (error) {
            console.error(`${this.debugPrefix} failed to fetch model schema before validation`, error);
            this.snackBar.open('Error while fetching model schema for workflow validation.');
            return;
        }

        this.jsonValidationService.validateAndSave(
            this.jsonValidationService.validateBySchemaType(modelPayloadForValidation, 'urn:equal:json-schema:core:model', this.package),
            () => this.persistWorkflowAndMetaData(workflowJSON, metadataJSON),
            (saving) => this.isSaving = saving
        );
    }

    private async buildModelPayloadWithWorkflow(workflowPayload: any): Promise<any> {
        const entity = `${this.package}\\${this.model}`;
        const latestModelSchema = await this.workbenchService.getSchema(entity).toPromise();
        this.modelScheme = latestModelSchema || {};

        const modelPayload = cloneDeep(this.modelScheme);
        modelPayload.workflow = workflowPayload;
        return modelPayload;
    }

    private persistWorkflowAndMetaData(workflowJSON: string, metadataJSON: string): Observable<{ success: boolean; message: string }> {
        return new Observable(observer => {
            this.workbenchService.saveWorkflow(this.package, this.model, workflowJSON).subscribe(
                (workflowSaved: any) => {
                    if (!workflowSaved) {
                        observer.next({ success: false, message: 'Error while saving the workflow.' });
                        observer.complete();
                        return;
                    }

                    const metadata$ = this.hasMetaData
                        ? this.workbenchService.saveMetaData(this.hasMetaData, metadataJSON)
                        : this.workbenchService.createMetaData('workflow', `${this.package}.${this.model}`, metadataJSON);

                    metadata$.subscribe(
                        (metaSaved: any) => {
                            if (!metaSaved) {
                                observer.next({ success: false, message: 'Error while saving workflow metadata.' });
                            } else {
                                observer.next({ success: true, message: 'Saved successfully' });
                            }
                            observer.complete();
                        },
                        () => {
                            observer.next({ success: false, message: 'Error while saving workflow metadata.' });
                            observer.complete();
                        }
                    );
                },
                () => {
                    observer.next({ success: false, message: 'Error while saving the workflow.' });
                    observer.complete();
                }
            );
        });
    }

    public showJSON(): void {
        this.matDialog.open(JsonViewerComponent, {
            data: this.export(),
            width: '70vw',
            height: '85vh'
        });
    }

    public showJSONMetaData(): void {
        this.matDialog.open(JsonViewerComponent, {
            data: this.exportMetaData(),
            width: '70vw',
            height: '85vh'
        });
    }

    public navigateToParent(): void {
        if (this.modelScheme.parent !== 'model') {
            const parentPackage = this.modelScheme.parent.split('\\')[0];
            const parentModel = this.modelScheme.parent.split('\\').slice(1).join('\\');
            this.router.navigate(['/package/' + parentPackage + '/model/' + parentModel + '/workflow']);
        }
    }

    public customButtonBehavior(evt: string): void {
        switch (evt) {
            case 'Show JSON':
                this.showJSON();
                break;
            case 'Show JSON meta data':
                this.showJSONMetaData();
                break;
        }
    }
}

