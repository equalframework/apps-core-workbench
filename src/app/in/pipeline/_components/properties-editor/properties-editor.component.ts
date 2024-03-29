import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'sb-shared-lib';
import { ControllerData } from '../../_objects/ControllerData';
import { Node } from '../../_objects/Node';
import { NodeLink } from '../../_objects/NodeLink';
import { Parameter } from '../../_objects/Parameter';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
  selector: 'app-properties-editor',
  templateUrl: './properties-editor.component.html',
  styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnInit, OnChanges {
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

  public chosenIcon: string = "data_array";

  public colors: string[] = ["whitesmoke", "beige", "lightcoral", "lightblue", "lightseagreen"];

  public chosenColor: string = "whitesmoke";

  @Input() selectedLink: NodeLink | undefined;

  @Input() parameters: Parameter[];

  public typeIcon: { [id: string]: string }

  public inputChoice: string = "";

  public selectedParams: Parameter[] = [];

  public inputValue: string = "";

  constructor(
    private api: ApiService,
    private typeUsage: TypeUsageService
  ) { }

  ngOnInit() {
    this.typeIcon = this.typeUsage.typeIcon
    this.getControllers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("selectedLink" in changes && this.selectedLink && !this.selectedLink.from.data) {
      this.inputChoice = "";
      this.selectedParams = [];
      for (let parameter of this.parameters) {
        if (parameter.link.to === this.selectedLink.from) {
          this.selectedParams.push(parameter);
        }
      }
    }
    else if ("selectedLink" in changes && this.selectedLink) {
      this.inputChoice = "";
      this.selectedParams = [];
      for (let parameter of this.parameters) {
        if (parameter.link === this.selectedLink) {
          this.selectedParams.push(parameter);
        }
      }
    }
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
            const x = new ControllerData(key, dirs, file, url);

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

  changeStyle() {
    if (this.selectedNode) {
      this.selectedNode.color = this.chosenColor;
      this.selectedNode.icon = this.chosenIcon;
    }
  }

  close() {
    this.changeState.emit("");
  }

  submit(value: string) {
    if (this.selectedLink && this.inputChoice !== "") {
      const parameter = new Parameter(value, this.inputChoice);
      parameter.link = this.selectedLink;
      this.parameters.push(parameter);
      this.selectedParams.push(parameter);
    }
    else if (this.selectedNode && this.inputValue !== "") {
      const parameter = new Parameter(this.inputValue, value);
      parameter.node = this.selectedNode;
      this.parameters.push(parameter);
      this.selectedParams.push(parameter);
      this.inputValue = "";
    }
  }
}