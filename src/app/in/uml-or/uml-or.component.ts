import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, Inject, OnChanges, OnInit, Optional } from '@angular/core';

import * as d3 from "d3"
import { Subject } from 'rxjs';
import { EmbbedApiService } from 'src/app/_services/embbedapi.service';
import { UMLORNode } from './_components/uml-or-displayer/_objects/UMLORNode';
import { Anchor, UMLORLink, test } from './_components/uml-or-displayer/_objects/UMLORLink';
import { cloneDeep, set } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { prettyPrintJson } from 'pretty-print-json';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';
import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-UMLOR',
  templateUrl: './uml-or.component.html',
  styleUrls: ['./uml-or.component.scss']
})
export class UMLORComponent implements OnInit, OnChanges {

  models: string[] = []

  state: string = 'normal'

  log = console.log

  nodes: UMLORNode[] = []

  links: UMLORLink[] = []

  selectedLink: number = -1

  selectedNode: number = -1

  package: string = ""
  model: string = ""

  model_scheme: any = {}

  need_save: boolean = false

  view_offset: { x: number, y: number } = { x: 0, y: 0 }

  current_filename = ""

  changeState(state: string) {
    if (this.state !== state) {
      this.state = state
      if (!["linking-to"].includes(this.state)) {
        this.selectedNode = -1
      }
      if (!["edit-link", "edit-from", "edit-to"].includes(this.state)) {
        this.selectedLink = -1
      }

    }
  }



  selected_class: string = ""
  tabIndex: number = 1

  color: { type: string, color: string }[] = []
  w = 10
  h = 10

  selected_classes: string[] = ["core\\User"]

  suits = [{ "source": "Microsoft", "target": "Amazon", "type": "licensing" }, { "source": "Microsoft", "target": "HTC", "type": "licensing" }, { "source": "Samsung", "target": "Apple", "type": "suit" }, { "source": "Motorola", "target": "Apple", "type": "suit" }, { "source": "Nokia", "target": "Apple", "type": "resolved" }, { "source": "HTC", "target": "Apple", "type": "suit" }, { "source": "Kodak", "target": "Apple", "type": "suit" }, { "source": "Microsoft", "target": "Barnes & Noble", "type": "suit" }, { "source": "Microsoft", "target": "Foxconn", "type": "suit" }, { "source": "Oracle", "target": "Google", "type": "suit" }, { "source": "Apple", "target": "HTC", "type": "suit" }, { "source": "Microsoft", "target": "Inventec", "type": "suit" }, { "source": "Samsung", "target": "Kodak", "type": "resolved" }, { "source": "LG", "target": "Kodak", "type": "resolved" }, { "source": "RIM", "target": "Kodak", "type": "suit" }, { "source": "Sony", "target": "LG", "type": "suit" }, { "source": "Kodak", "target": "LG", "type": "resolved" }, { "source": "Apple", "target": "Nokia", "type": "resolved" }, { "source": "Qualcomm", "target": "Nokia", "type": "resolved" }, { "source": "Apple", "target": "Motorola", "type": "suit" }, { "source": "Microsoft", "target": "Motorola", "type": "suit" }, { "source": "Motorola", "target": "Microsoft", "type": "suit" }, { "source": "Huawei", "target": "ZTE", "type": "suit" }, { "source": "Ericsson", "target": "ZTE", "type": "suit" }, { "source": "Kodak", "target": "Samsung", "type": "resolved" }, { "source": "Apple", "target": "Samsung", "type": "suit" }, { "source": "Kodak", "target": "RIM", "type": "suit" }, { "source": "Nokia", "target": "Qualcomm", "type": "suit" }]
  test: { source: string, target: string, type: string }[] = []

  constructor(
    private api: EmbbedApiService,
    private router: RouterMemory,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    UMLORNode.init(this.api)
    await this.init()
  }

  has_meta_data: number | undefined = undefined

  exists: boolean = false

  async init() {
    this.nodes = []
    this.links = []

    if (this.current_filename)
      try {
        const parts = this.current_filename.split("::")
        const schema = await this.api.getUMLContent(parts[0], "or", parts[1])
        for (let item of schema) {
          this.nodes.push(await UMLORNode.AsyncConstructor(item.entity, item.hidden, item.position.x, item.position.y, item.showInheritance))
        }
      } catch (e) {
        console.error(e)
        this.nodes = []
      }
    this.refresh()
  }

  refresh() {
    this.links = []
    this.nodes = [...this.nodes]
    for (let node of this.nodes) {
      let count = 0
      // Checking parents
      if (node.showInheritance && node.parent !== 'equal\\orm\\Model') {
        const node2 = this.getNodeByName(node.parent)
        if (node2) {
          this.links.push(new UMLORLink(node, node2, "", "", "extends"))
        }
      }

      // Checking relations
      if (!node.showRelations) {
        continue
      }
      for (let key of node.DisplayFields) {
        if (node.hidden.includes(key)) {
          continue
        }
        const field = node.fields[key]
        if (!['many2many', 'one2many', 'computed', 'many2one'].includes(field.type)) {
          continue
        }
        if (field.type === 'computed' && !['many2many', 'one2many', 'many2one'].includes(field.result_type)) {
          continue
        }
        console.log(field.foreign_object)
        const node2 = this.getNodeByName(field.foreign_object)
        if (node2 === null) {
          continue
        }

        if (field.type === 'many2one') {
          let ok = true
          for (let key of node2.DisplayFields) {
            console.log(node2.fields[key].foreign_object)
            if (node2.fields[key].type !== "one2many" && (node2.fields[key].type !== "computed" || node2.fields[key].result_type !== "one2many")) {
              continue
            }
            if (node2.fields[key].foreign_object === node.entity) {
              ok = false
              break
            }
          }
          if (!ok) {
            continue
          }
        }
        this.links.push(new UMLORLink(node, node2, key, field.foreign_field ? field.foreign_field : "", field.type === 'computed' ? field.result_type : field.type))
        console.log("siuuu")
        count++
      }
    }
  }

  reset() {
    const d = this.matDialog.open(DialogConfirmComponent, { data: "Are you sure you want to cancel all your changes ?" })
    d.afterClosed().subscribe((data) => {
      if (data) {
        this.init()
      }
    })
  }

  newFile() {
    const d = this.matDialog.open(DialogConfirmComponent, { data: "Are you sure you want to start a new file ? All changes will be lost." })
    d.afterClosed().subscribe((data) => {
      if (data) {
        this.current_filename = ""
        this.init()
      }
    })
  }

  getNodeByName(name: string): UMLORNode | null {
    for (let item of this.nodes) {
      if (item.entity === name) return item
    }
    return null
  }

  ngOnChanges() {
    console.log("CALLED")
  }

  async addNode(value: string) {
    this.nodes.push(await UMLORNode.AsyncConstructor(value, ["deleted", "created", "creator", "modified", "modifier"], -this.view_offset.x + 100, -this.view_offset.y + 100))
    this.refresh()
  }

  deleteNode(index: number) {
    if (index >= 0) {
      const deleted = this.nodes.splice(index, 1)

      let new_links = []
      for (let link of this.links) {
        if (link.from === deleted[0] || link.to === deleted[0]) {
          continue
        }
        new_links.push(link)
      }
      this.links = new_links
      index = -1
      console.log(this.links)
      this.refresh()
    }
  }

  dragoff(event: CdkDragEnd) {
    console.log(event)
  }

  requestLinkFrom() {
    if (this.state !== 'linking-from' && this.state !== 'linking-to')
      this.changeState('linking-from')
  }

  get sizeViewer(): number {
    switch (this.state) {
      case "normal":
        return 12
      default:
        return 9
    }
  }

  get sizeEditor(): number {
    switch (this.state) {
      case "normal":
      case "link-to":
      case "link-from":
        return 0
      case "edit-link":
        return 4
      default:
        return 3
    }
  }

  async save() {
    const d = this.matDialog.open(FileSaverComponent, { data: { path: this.current_filename }, width: "60vw", maxWidth: "600px" })
    d.afterClosed().subscribe(async (data: string | null) => {
      if (data) {
        const res = await this.api.saveUML(data.split("::")[0], "or", data.split("::")[1], JSON.stringify(this.export()))
        if (res) {
          this.snackBar.open("Saved successfully !", "INFO")
          this.current_filename = data
          this.init()
        }
      }
    })
  }

  async load() {
    const d = this.matDialog.open(FileLoaderComponent, { data: { path: this.current_filename }, width: "60vw", maxWidth: "600px" })
    d.afterClosed().subscribe(async (data: string | null) => {
      if (data) {
        this.current_filename = data
        this.init()
      }
    })
  }

  export(): any[] {
    let ret: any = []
    for (let node of this.nodes) {
      ret.push(node.export())
    }
    return ret
  }

  customButtonBehavior(evt: string) {
    switch (evt) {
      case "Show JSON":
        this.matDialog.open(Jsonator, { data: this.export(), width: "70vw", height: "80vh" })
        break
      case "Print to PDF":
        this.state = "normal"
        setTimeout(() => {
          window.print()
        }, 100);

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
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  get datajson() {
    return prettyPrintJson.toHtml(this.data)
  }
}