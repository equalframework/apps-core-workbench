import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-properties-editor',
  templateUrl: './properties-editor.component.html',
  styleUrls: ['./properties-editor.component.scss']
})
export class PropertiesEditorComponent implements OnInit {
  @Input() state: string = "";

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

  public controllers: { type: string, package: string, name: string, url: string }[] = [];

  public searchValue: string = "";

  public filterData: { type: string, package: string, name: string, url: string }[] = [];

  @Output() addNode = new EventEmitter<string>();

  constructor(
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.getControllers();
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
            const x = { type: key, package: dirs, name: file, url: url };

            set.add(dirs);
            this.controllers.push(x);
          }
        }
      }
      this.packages = Array.from(set);
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
            if (controller.url.includes(this.searchValue)) {
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
            if (this.searchValue === "" || controller.url.includes(this.searchValue)) {
              this.filterData.push(controller);
            }
          }
        }
        break;
      case "Actions":
        for (let controller of this.controllers) {
          if (controller.type === "actions") {
            if (this.searchValue === "" || controller.url.includes(this.searchValue)) {
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

  public add() {
  }
}