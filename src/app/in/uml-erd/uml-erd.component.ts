import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, Inject, OnChanges, OnInit, Optional } from '@angular/core';
import { UmlErdNode } from './_components/uml-erd-displayer/_objects/UmlErdNode';
import { Anchor, UmlErdLink } from './_components/uml-erd-displayer/_objects/UmlErdLink';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';

import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';
import { WorkbenchService } from '../_services/workbench.service';
import { ExplorerDialogComponent } from 'src/app/_dialogs/explorer-dialog/explorer-dialog.component';
import { JsonViewerComponent } from 'src/app/_components/json-viewer/json-viewer.component';

@Component({
    selector: 'uml-erd',
    templateUrl: './uml-erd.component.html',
    styleUrls: ['./uml-erd.component.scss']
})
export class UmlErdComponent implements OnInit, OnChanges {

    public models: string[] = [];
    public state: string = 'normal';
    public nodes: UmlErdNode[] =  [];
    public links: UmlErdLink[] = [];
    public selectedLink: number = -1;
    public selectedNode: number = -1;
    public package: string = "";
    public model: string = "";
    public model_scheme: any = {};
    public need_save: boolean = false;
//    public view_offset:{x:number, y:number} = {x:0, y:0};
    public current_filename = "";

    public selected_class: string = "";
    public tabIndex: number = 1

    public color: { type: string, color: string }[] = [];
    public w = 10;
    public h = 10;

    public selected_classes: string[] = ["core\\User"];
    public has_meta_data:number|undefined = undefined;

    public exists:boolean = false;

    constructor(
        private workbenchService: WorkbenchService,
        private matDialog:MatDialog,
        private snackBar:MatSnackBar
    ) { }

    public async ngOnInit() {
        UmlErdNode.init(this.workbenchService);
        await this.init();
    }

    public async init() {
        this.nodes = [];
        this.links = [];

        if(this.current_filename) {
            try {
                const parts = this.current_filename.split("::");
                const schema = await this.workbenchService.getUMLContent(parts[0], "erd", parts[1]).toPromise();
                for(let item of schema) {
                    this.nodes.push(await UmlErdNode.AsyncConstructor(item.entity, item.hidden, item?.fields ?? [], item.position?.x, item.position?.y, item.show_inheritance, item.show_relations));
                }
            }
            catch(e) {
                console.error(e);
                this.nodes = [];
            }
        }
        this.refresh();
    }

    public changeState(state:string) {
        if(this.state !== state) {
            this.state = state;
            if(!["linking-to"].includes(this.state)){
                this.selectedNode = -1;
            }
            if(!["edit-link","edit-from","edit-to"].includes(this.state)){
                this.selectedLink = -1;
            }
        }
    }

    public refresh() {
        this.links = [];
        this.nodes = [...this.nodes];
        for(let node of this.nodes) {
            let count = 0;
            // Checking parents
            if(node.show_inheritance && node.parent !== 'equal\\orm\\Model') {
                const node2 = this.getNodeByName(node.parent);
                if(node2) {
                    this.links.push(new UmlErdLink(node, node2, "", "", "extends"));
                }
            }

            // Checking relations
            if(!node.show_relations) {
                continue;
            }
            for(let key of node.fields) {
                if(node.hidden.includes(key)) {
                    continue;
                }
                if(!node.schema.hasOwnProperty(key)) {
                    continue;
                }
                const field = node.schema[key]
                if(!['many2many','one2many','computed','many2one'].includes(field.type)) {
                    continue;
                }
                if(field.type === 'computed' && !['many2many','one2many','many2one'].includes(field.result_type)) {
                    continue;
                }

                const node2 = this.getNodeByName(field.foreign_object);
                if( node2 === null ){
                    continue;
                }

                if(field.type === 'many2one') {
                    let ok = true;
                    for(let key of node2.fields) {
                        if(!node2.schema.hasOwnProperty(key)) {
                            continue;
                        }
                        if(node2.schema[key].type !=="one2many" && (node2.schema[key].type !=="computed" || node2.schema[key].result_type !== "one2many")) {
                            continue;
                        }
                        if(node2.schema[key].foreign_object === node.entity) {
                            ok = false;
                            break;
                        }
                    }
                    if(!ok) {
                        continue;
                    }
                }
                this.links.push(new UmlErdLink(node, node2, key, field.foreign_field ? field.foreign_field : "", field.type ==='computed'?field.result_type : field.type));
                ++count;
            }
        }
    }

    public reset() {
        const d = this.matDialog.open(DialogConfirmComponent, {data:"Are you sure you want to cancel all your changes ?"})
            d.afterClosed().subscribe((data)=> {
            if(data) {
                this.init();
            }
        })
    }

    public newFile() {
        const d = this.matDialog.open(DialogConfirmComponent, {data:"Are you sure you want to start a new file ? All changes will be lost."})
        d.afterClosed().subscribe((data) => {
            if(data) {
                this.current_filename = "";
                this.init();
            }
        })
    }

    public getNodeByName(name:string):UmlErdNode|null {
        for(let item of this.nodes) {
            if(item.entity === name) {
                return item;
            }
        }
        return null;
    }

    public ngOnChanges() {
    }

    public async addNode(value:string){
        // this.nodes.push(await UmlErdNode.AsyncConstructor(value, ["deleted","created","creator","modified","modifier"], [], -this.view_offset.x+100, -this.view_offset.y+100));
        this.nodes.push(await UmlErdNode.AsyncConstructor(value, ["deleted","created","creator","modified","modifier"], [], 100, 100));
        this.refresh();
    }

    public deleteNode(index:number) {
        if(index >= 0) {
            const deleted = this.nodes.splice(index,1);

            let new_links = [];
            for(let link of this.links) {
                if(link.from === deleted[0] || link.to === deleted[0] ) {
                    continue;
                }
                new_links.push(link);
            }
            this.links = new_links;
            index = -1;
            this.refresh();
        }
    }

    public requestLinkFrom() {
        if(this.state !== 'linking-from' && this.state !== 'linking-to') {
            this.changeState('linking-from');
        }
    }

    public get sizeViewer():number {
        switch(this.state) {
            case "normal" :
                return 12;
            default :
                return 9;
        }
    }

    public get sizeEditor():number {
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

    public saveAs() {
        const package_name = this.current_filename.split(":")[0];
        const file_name_without_ext = this.current_filename.trim().split(":").pop()?.split(".")[0] || "default";

        const dialogData = {
          fetchItems: (package_name: string) => this.workbenchService.getUMLList('erd', package_name),
          formatItem: (file: string) => this.formatErdJson(file),
          createItem: (item: string, package_name: string) =>
            this.workbenchService.saveUML(package_name, 'erd', item, JSON.stringify(this.export())),
          current_file_name: file_name_without_ext,
          current_package: package_name
        };

        const d = this.openExplorerDialog(dialogData);
        d.afterClosed().subscribe(async (data: string | null) => {
          if (data) {
            this.current_filename = data;
            console.log('loaded: ', data);
            this.init();
          }
        });
      }


    public async save() {
        const package_name = this.current_filename.split(":")[0]
        const file_name_without_ext = this.current_filename.trim().split(":").pop()?.split(".")[0] || "default";

        console.log("file name ", file_name_without_ext)
        const res = await this.workbenchService.saveUML(package_name, "erd",file_name_without_ext , JSON.stringify(this.export())).toPromise();
                if(res) {
                    this.snackBar.open("Saved successfully","INFO");
                    this.current_filename = package_name+'::'+ file_name_without_ext +'.erd.json';
                    this.init();
                }
        /*const d = this.matDialog.open(FileSaverComponent, {
                data: {
                    path: this.current_filename
                },
                width: "60vw",
                maxWidth: "600px"
            });

        d.afterClosed().subscribe(async (data:any) => {
            if(data) {
                const res = await this.workbenchService.saveUML(data.package_name, "erd", data.file_name, JSON.stringify(this.export())).toPromise();
                if(res) {
                    this.snackBar.open("Saved successfully","INFO");
                    this.current_filename = data.package_name+'::'+data.file_name+'.erd.json';
                    this.init();
                }
            }
        });*/
    }

    private formatErdJson(file:string){
        return `${file}.erd.json`;
    }
    public load() {
        const dialogData = {
          fetchItems: (package_name: string) => this.workbenchService.getUMLList('erd', package_name),
          formatItem: (file: string) => this.formatErdJson(file),
          createItem: (item: string, package_name: string) =>
            this.workbenchService.saveUML(package_name, 'erd', item, '')
        };

        const d = this.openExplorerDialog(dialogData);
        d.afterClosed().subscribe(async (data: string | null) => {
          if (data) {
            this.current_filename = data;
            console.log('loaded: ', data);
            this.init();
          }
        });
      }



    public export(): any[] {
        let ret:any = [];
        for(let node of this.nodes) {
            ret.push(node.export());
        }
        return ret;
    }

    public customButtonBehavior(evt: string) {
        switch(evt) {
        case "Show JSON" :
            this.matDialog.open(JsonViewerComponent, {data:this.export(), width : "70vw", height : "80vh"});
            break;
        case "Print to PDF" :
            this.state = "normal"
            setTimeout(() => {
                window.print();
            }, 100);
            break;
        }

    }

    private openExplorerDialog(dialogData: any): MatDialogRef<ExplorerDialogComponent> {
        return this.matDialog.open(ExplorerDialogComponent, {
          width: "100vw",
          maxWidth: "40vw",
          data: dialogData
        });
      }

}

