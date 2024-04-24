import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ContextService, EnvService } from 'sb-shared-lib';
import { prettyPrintJson } from 'pretty-print-json';
import { cloneDeep, update } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorComponent } from '../package/_components/mixed-creator/mixed-creator.component';
import { EmbeddedApiService } from 'src/app/_services/embedded-api.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss'],
  encapsulation : ViewEncapsulation.Emulated,
})
export class RoutesComponent implements OnInit {

    routelist:any = {}
    public child_loaded = false;
    public step = 1;
    public selected_package: string = "";
    public selected_route: string = "";
    public routes_for_selected_package: string[] = [];
    public schema: any;
    public types: any;
    real_name:{[id:string]:string} = {}

    loading = true

    constructor(
        private api: EmbeddedApiService,
        private route:RouterMemory,
        private activateRoute:ActivatedRoute,
        public matDialog:MatDialog,
        public env:EnvService
    ) { }

    public async ngOnInit() {
        this.init()
    }

    async init() {
        const a = this.activateRoute.snapshot.paramMap.get('selected_package')
        this.selected_package =  a ? a : ""
        this.routes_for_selected_package = []
        let y = (await this.api.getRoutesByPackages(this.selected_package))
        for(let file in y) {
            for(let route in y[file]) {
                this.real_name[file.split("-")[0]+"-"+route] = route
                this.routes_for_selected_package.push(file.split("-")[0]+"-"+route)
                this.routelist[file.split("-")[0]+"-"+route] = {"info":{"file":file,"package":this.selected_package},"methods":y[file][route]}
            }
        }
        console.log(this.real_name)
        this.loading = false
    }

    /**
     * Select a class.
     *
     * @param eq_route the class that the user has selected
     */
    public async onclickClassSelect(eq_route: string) {
        this.selected_route = eq_route;
    }

    public async onChangeStep(step:number) {
        this.step = step;
        if(step == 2) {
            this.route.navigate(['/fields',this.selected_package,this.selected_route])
        }
        if(step===3) {
            this.route.navigate(['/views',"entity",this.selected_package+'\\'+this.selected_route])
        }
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onupdateClass(event: { old_node: string, new_node: string }) {
    }

    /**
     * Delete a class for the selected package.
     *
     * @param eq_route the name of the class which will be deleted
     */
    public ondeleteClass(eq_route: string) {
    }

    /**
     * Create a class for the selected package.
     *
     * @param eq_route the name of the new class
     */
    public oncreateClass() {
        let d = this.matDialog.open(MixedCreatorComponent,{
            data: { 
                type: "route", 
                package: this.selected_package, 
                lock_type : true,
                lock_package: true, 
            },width : "40em",height: "26em"
        })

        d.afterClosed().subscribe(() => {
            // Do stuff after the dialog has closed
            this.init()
        });
    }


    /**
     *
     * @returns a pretty HTML string of a schema in JSON.
     */
    public getJSONSchema() {
        if(this.schema) {
            return this.prettyPrint(this.schema);
        }
        return null;
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
        if(this.step === 1) {
            this.route.goBack()
        }
        this.step --;
    }




}