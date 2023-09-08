import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ContextService } from 'sb-shared-lib';
import { WorkbenchService } from './_service/package.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-models',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PackageComponent implements OnInit {

    public child_loaded = false;
    public step = 0;
    public selected_package: string = "";
    public selected_category: string = "";
    public categories:string[] = ["Models","Controllers","Routes"]
    public classes_for_selected_package: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public packages: string[];
    // http://equal.local/index.php?get=core_config_classes
    public initialised_packages : string[]

    constructor(
        private context: ContextService,
        private api: WorkbenchService,
        private snackBar: MatSnackBar
    ) { }

    public async ngOnInit() {
        this.packages = await this.api.getPackages();
    }

    /**
     * Select a package when user click on it.
     *
     * @param eq_package the package that the user has selected
     */
    public async onclickPackageSelect(eq_package: string) {
        const old = this.selected_package;
        this.selected_package = eq_package;
        if(old === this.selected_package) {
            this.selected_category = "";
            this.child_loaded = false;
            this.step = 1;
        }
        this.initialised_packages = await this.api.getInitialisedPackages()
    }

    public async onclickCategorySelect(eq_category: string) {
        const old = this.selected_category;
        this.selected_category = eq_category;
        if(old === this.selected_category) {
            this.child_loaded = false;
            this.step = 2;
        }
        console.log(this.selected_category)
    }

    /**
     * Update the name of a package.
     *
     * @param event contains the old and new name of the package
     */
    public onupdatePackage(event: { old_node: string, new_node: string }) {
        this.api.updatePackage(event.old_node, event.new_node);
        /* MAY BE USEFUL WHEN LINK TO BACKEND
        if (this.selected_package == event.old_node) {
            this.selected_package = event.new_node;
        }
        this.eq_class[event.new_node] = this.eq_class[event.old_node];
        delete this.eq_class[event.old_node];
        */
    }

    /**
     * Delete a package.
     *
     * @param eq_package the name of the package which will be deleted
     */
    public ondeletePackage(eq_package: string) {
        this.api.deletePackage(eq_package);
        /* MAY BE USEFUL WHEN LINK TO BACKEND
        if (this.selected_package == eq_package) {
            this.selected_package = "";
            this.selected_class = "";
            this.selected_field = "";
            this.child_loaded = false;
        }
        */
    }

    /**
     * Call the api to create a package.
     *
     * @param new_package the name of the new package
     */
    public oncreatePackage(new_package: any) {
        this.api.createPackage(new_package);
    }

    /**
     * Function to pretty-print JSON objects as an HTML string
     *
     * @param input a JSON
     * @returns an HTML string
     */
    private prettyPrint(input: any) {
        return prettyPrintJson.toHtml(input);
    }

    public getBack() {
        this.step --;
    }
}

function compareDictRecursif(dict1:any, dict2:any):number {
    if(dict1 === undefined) return -1
    if(dict2 === undefined) return 1
    if(typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 === dict2) {
        return 0
    }
    var res:number
    for(var item in dict1) {
        if(dict2[item] === undefined) return 1
        res = compareDictRecursif(dict1[item],dict2[item])
        if(res !== 0) return 1
    }
    for(var item in dict2) {
        if(dict1[item] === undefined) return 1
        res = compareDictRecursif(dict1[item],dict2[item])
        if(res !== 0) return -1
    }
    return 0
}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}