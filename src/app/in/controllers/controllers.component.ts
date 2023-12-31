import { Component, OnInit, ViewEncapsulation, Output } from '@angular/core';
import { ControllersService } from './_service/controllers.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MixedCreatorComponent } from '../package/_components/mixed-creator/mixed-creator.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-controllers',
    templateUrl: './controllers.component.html',
    styleUrls: ['./controllers.component.scss'],
    encapsulation: ViewEncapsulation.None
})
/**
 * Component used to display the component of a package (using /controllers/:package route)
 */
export class ControllersComponent implements OnInit {

    public packages: any;
    public controllers: any;
    public selected_package = '';
    public selected_controller = '';
    public selected_property = '';
    public selected_type_controller = '';
    public schema: any;
    public controller_access_restrained: boolean;
    public selected_desc = '';
    public fetch_error = false

    public step = 1;

    constructor(
        private api: ControllersService,
        private snackBar: MatSnackBar,
        private activateRoute: ActivatedRoute,
        private route:RouterMemory,
        private matDialog:MatDialog
    ) { }

    public async ngOnInit() {
        this.init()
    }

    async init() {
        this.packages = await this.api.getPackages();
        const a = this.activateRoute.snapshot.paramMap.get('selected_package')
        this.selected_package = a ? a : ''
        this.controllers = await this.api.getControllers(this.selected_package);
        this.selected_controller = "";
        this.selected_property = "";
    }

    /**
     * Select a controller when user click on it, load information about the controller.
     *
     * @param controller the controller that the user has selected
     */
    public async onclickControllerSelect(event: { type: string, name: string }) {
        this.selected_type_controller = event.type;
        let response = await this.api.getAnnounceController(event.type, event.name);
        this.controller_access_restrained = !response
        if (!response) {
            this.fetch_error = true
            this.snackBar.open('Not allowed', 'Close', {
                duration: 1500,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        } else {
            this.fetch_error = false
            this.selected_property = 'description'
            this.schema = response.announcement;
        }
        this.selected_controller = event.name;
    }

    public changeStep(event:number) {
        this.step = event
    }

    /**
     * Select a property when user click on it.
     *
     * @param property the property that the user has selected
     */
    public async onclickPropertySelect(property: string) {
        this.selected_property = property;
    }

    /**
     * Update the name of a controller.
     *
     * @param event contains the old and new name of the controller
     */
    public onupdateController(event: { type: string, old_node: string, new_node: string }) {

    }

    /**
     * Delete a controller.
     *
     * @param controller the name of the controller which will be deleted
     */
    public async ondeleteController(event: { type: string, name: string }) {
            let nom = event.name.split("_").slice(1).join("_")
            let res = await this.api.deleteController(this.selected_package,event.type,nom)
            if(!res){
                this.snackBar.open("Deleted")
                this.selected_controller= ""
                this.init()
            }
    }

    /**
     * Call the api to create a controller.
     *
     * @param new_package the name of the new controller
     */
    public oncreateController(event: { type: string, name: string }) {
        let d = this.matDialog.open(MixedCreatorComponent,{
            data: { 
                type: event.type, 
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

    public getProperties() {
        return Object.keys(this.schema);
    }

    public submitRequest(params: any) {
        console.warn(params);
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

    controllerNav(choice:number) {
        switch(choice) {
        case 1:
            this.route.navigate(['/controllers/params',this.selected_type_controller ,this.selected_controller],{"selected":this.selected_controller})
            break
        case 2:
            this.route.navigate(['/translation',"controller",this.selected_package,this.selected_controller.split("_").slice(1).join("\\")],{"selected":this.selected_controller})
            break
        case 3:
            this.route.navigate(['/controllers/return',this.selected_type_controller ,this.selected_controller],{"selected":this.selected_controller})
            break
        }
    }
}
