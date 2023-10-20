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
    public selected_element:{package?:string,name:string,type:string,more?:any} = {name:"",type:""};
    public classes_for_selected_package: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public elements: {package?:string,name:string,type:string,more?:any}[] = [];
    // http://equal.local/index.php?get=core_config_classes

    public initialised_packages:string[]
    public package_consistency:any
    public schema:any
    public selected_type_controller:string = ''
    public fetch_error:boolean = false
    public isloading:boolean = true
    public routelist:any = {}

    sideload = false

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
                    this.api.getRoutesByPackages(pack).then((y) => {
                        for(let file in y) {
                            for(let route in y[file]) {
                                this.elements.push({package:pack, name:route, type:"route",more:file})
                                this.routelist[pack+file+route] = {"info":{"file":file,"package":pack},"methods":y[file][route]}
                            }
                        }
                    }).then( () =>
                        this.api.getViewByPackage(pack).then((y) => {
                            y.forEach(view =>{
                                this.elements.push({name:view,type:"view",package:pack})
                            })
                            this.elements.sort((a,b) => 
                                (a.type === "route" ? a.package+a.more+a.name : (a.type === "class" ? a.package+a.name : a.name)).replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase() < (b.type === "class" ? b.package+b.name : b.name).replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase() ? -1 : 1 
                            )
                            this.isloading = false
                        })
                    )
                })  
            })
        })
    }

    /**
     * Select a package when user click on it.
     *
     * @param eq_package the package that the user has selected
     */
    public async onclickPackageSelect(eq_element:{package?:string,name:string,type:string,more?:any}) {
        this.selected_element = eq_element;
        this.sideload = true
        if(eq_element.type === "package") {
            this.initialised_packages = await this.api.getInitialisedPackages()
            this.package_consistency = await this.api.getPackageConsistency(eq_element.name)
        }
        if(eq_element.type === "class") {
            this.schema = await this.api.getSchema(eq_element.package + '\\' + eq_element.name);
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
        this.sideload = false
    }

    async refresh_consitency() {
        this.initialised_packages = await this.api.getInitialisedPackages()
        this.package_consistency = await this.api.getPackageConsistency(this.selected_element.name)
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

    public onClickRoute() {
        this.router.navigate(['/routes', this.selected_element.name],{"selected":this.selected_element});
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
        if(event===4 && this.selected_element.package) {
            this.router.navigate(['/translation',"model",this.selected_element.package,this.selected_element.name],{"selected":this.selected_element})
        }
    }

    goTo(ev:{name:string,package?:string,type?:string}) {
        let els = this.elements.filter(el => (el.name === ev.name && (!ev.package || ev.package === el.package)))
        this.onclickPackageSelect(els[0])
    }

    onViewEditClick() {
        this.router.navigate(['/views_edit',this.selected_element.name],{"selected":this.selected_element})
    }

    async delElement(node:{package?:string,name:string,type:string,more?:any}) {
        let res
        switch(node.type) {
        case "view":
            let sp = node.name.split(":")
            res = await this.api.deleteView(sp[0],sp[1])
            if(!res){
                this.snackBar.open("Deleted")
                this.selected_element = {name:"",type:""}
                this.refresh()
            }
            break
        case "package":
            res = await this.api.deletePackage(node.name)
            if(!res){
                this.snackBar.open("Deleted")
                this.selected_element = {name:"",type:""}
                this.refresh()
            }
            break
        case "class":
            if(node.package) {
                res = await this.api.deleteModel(node.package,node.name)
                if(!res){
                    this.snackBar.open("Deleted")
                    this.selected_element = {name:"",type:""}
                    this.refresh()
                }
            }else {
                this.snackBar.open("Error : unknown model")
            }
            break
        case "do":
        case "get":
            if(node.package) {
                let nom = node.name.split("_").slice(1).join("_")
                res = await this.api.deleteController(node.package,node.type,nom)
                if(!res){
                    this.snackBar.open("Deleted")
                    this.selected_element = {name:"",type:""}
                    this.refresh()
                }
            }else {
                this.snackBar.open("Error : unknown controller")
            }
            break
        default:
            this.snackBar.open("WIP")
            break;
        }
    }

    controllerNav(choice:number) {
        switch(choice) {
        case 1:
            break
        case 2:
            this.router.navigate(['/translation',"controller",this.selected_element.package,this.selected_element.name.split("_").slice(1).join("\\")],{"selected":this.selected_element})
        }
    }
}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}