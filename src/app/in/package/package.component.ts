import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ContextService } from 'sb-shared-lib';
import { WorkbenchService } from './_service/package.service'
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { RouterMemory } from 'src/app/_services/routermemory.service';


@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss'],
  encapsulation : ViewEncapsulation.Emulated,
})
export class PackageComponent implements OnInit {

    public child_loaded = false;
    public selected_element:{package?:string,name:string,type:string} = {name:"",type:""};
    public classes_for_selected_package: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public elements: {package?:string,name:string,type:string}[] = [];
    // http://equal.local/index.php?get=core_config_classes

    public initialised_packages:string[]
    public package_consistency:any
    public schema:any
    public selected_type_controller:string = ''
    public fetch_error:boolean = false
    public isloading:boolean = true
    public routelist:any = {}

    constructor(
        private context: ContextService,
        private api: WorkbenchService,
        private snackBar: MatSnackBar,
        private router:RouterMemory
    ) { }

    public async ngOnInit() {
        let args = this.router.retrieveArgs()
        if(args && args['selected']){
            this.onclickPackageSelect(args['selected'])
        }
        await this.init()
    }

    async refresh() {
        this.init()
    }

    async init() {
        this.isloading=true
        this.elements = []
        let classes = await this.api.getClasses();
        this.api.getPackages().then((packarr) => {
            packarr.forEach(pack => {
                this.elements.push({name:pack,type:"package"})
                classes[pack].forEach(classe => {
                    this.elements.push({package:pack ,name:classe,type:"class"})
                });
                this.api.getControllers(pack).then((x) => {
                    x.data.forEach(cont => {
                        this.elements.push({package:pack,name:cont,type:"get"})
                    });
                    x.actions.forEach(cont => {
                        this.elements.push({package:pack,name:cont,type:"do"})
                    });
                    this.api.getViewByPackage(pack).then((y) => {
                        y.forEach(view =>{
                            this.elements.push({name:view,type:"view"})
                        })
                        this.elements.sort((a,b) => 
                            (a.type === "class" ? a.package+a.name : a.name).replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase() < (b.type === "class" ? b.package+b.name : b.name).replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase() ? -1 : 1 
                        )
                        this.isloading = false
                    })
                })  
            })
            this.api.getRoutes().then((d) => {
                this.routelist = d
                for(let name in this.routelist){
                    this.elements.push({name: name, type: "route"})
                }
            })
        })
    }

    /**
     * Select a package when user click on it.
     *
     * @param eq_package the package that the user has selected
     */
    public async onclickPackageSelect(eq_element:{package?:string,name:string,type:string}) {
        if(eq_element.type === "package") {
            this.initialised_packages = await this.api.getInitialisedPackages()
            this.package_consistency = await this.api.getPackageConsistency(eq_element.name)
        }
        if(eq_element.type === "class") {
            this.schema = await this.api.getSchema(eq_element.package + '\\' + eq_element.name);
            console.log(this.schema)
        }
        if(eq_element.type === "do" || eq_element.type === "get") {
                let response
                if(eq_element.package)
                    response = await this.api.getAnnounceController(eq_element.type, eq_element.name);
                if (!response) {
                    this.fetch_error = true
                    this.snackBar.open('Not allowed', 'Close', {
                        duration: 1500,
                        horizontalPosition: 'left',
                        verticalPosition: 'bottom'
                    });
                } else {
                    this.fetch_error = false
                    this.schema = response.announcement;
                }
        }
        this.selected_element = eq_element;
    }

    public onClickModels() {
        this.router.navigate(['/models', this.selected_element.name],{"selected":this.selected_element});
    }

    public onClickControllers() {
        this.router.navigate(['/controllers', this.selected_element.name],{"selected":this.selected_element});
    }

    public onClickView() {
        this.router.navigate(['/views', "package", this.selected_element.name],{"selected":this.selected_element});
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

    public onChangeStepModel(event:number) {
        if(event===2) {
            this.router.navigate(['/fields',this.selected_element.package ? this.selected_element.package : "",this.selected_element.name],{"selected":this.selected_element})
        }
        if(event===3 && this.selected_element.package) {
            this.router.navigate(['/views',"entity",this.selected_element.package+'\\'+this.selected_element.name],{"selected":this.selected_element})
        }
    }

    goTo(ev:string) {
        let el = this.elements.filter(el => el.name === ev)[0]
        this.onclickPackageSelect(el)
    }

    onViewEditClick() {
        this.router.navigate(['/views_edit',this.selected_element.name],{"selected":this.selected_element})
    }

    async delElement(node:{package?:string,name:string,type:string}) {
        switch(node.type) {
        case "view":
            let sp = node.name.split(":")
            let res = await this.api.deleteView(sp[0],sp[1])
            if(res) this.snackBar.open("Deleted")
            else this.snackBar.open("Error during deletion")
            break
        default:
            this.snackBar.open("WIP")
            break;
        }
        if(this.selected_element === node){
            this.selected_element === undefined
        }
        this.refresh()
    }
}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}