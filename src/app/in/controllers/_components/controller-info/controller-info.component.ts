import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { isArray, isObject, isString } from 'lodash';
import { ControllersService } from '../../_service/controllers.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { ResponseComponentSubmit } from '../response/response.component';
import { TypeUsageService } from 'src/app/_services/type-usage.service';

@Component({
    selector: 'app-controller-info',
    templateUrl: './controller-info.component.html',
    styleUrls: ['./controller-info.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})


/**
 * @description
 * This component is used to display information about controllers on the right of a search list.
 * 
 * @Input current_controller name of the controller to display
 * @Input controller_type type of the controller to display ('do' or 'get')
 * @Input scheme : announcement of the controller to display
 * @Input selected_package : package of current_controller
 * @Input fetch_error : indicate if the announce has been successfully fetched or not
 * @Input moving : indicate if navigation between type of element is posible (with goto)
 * 
 * @Output goto : return an identifier for displaying a new element (here : a route)
 * 
 * @attribute paramsValue : dict that hold value of params entered by the user
 * @attribute presentRequiredParams : dict containing boolean indicating if a param is valid
 * @attribute canSubmit : indicate if the user is able to sumbit the action
 * @attibute routes : list of all defined route of the equal instance
 * @attribute filtered_routes : list of all defined route of the equal instance that mention current_controller
 */
export class ControllerInfoComponent implements OnInit {

    @Input() current_controller: string;
    @Input() controller_type: string;
    @Input() scheme: any;
    @Input() selected_package: string;
    @Input() fetch_error:boolean
    @Input() moving:boolean = false
    @Output() goto = new EventEmitter<string>();

    @Output() navigate = new EventEmitter<number>()

    iconType:any

    public paramsValue: any;
    public presentRequiredParams: any;
    public canSubmit: boolean
    public routes: {[id:string]:any}
    public filtered_routes: {[id:string]:any} = {}
    public obk = Object.keys

    tojsonstring = JSON.stringify

    constructor(
        private snackBar: MatSnackBar,
        private api: ControllersService,
        public dialog: MatDialog,
        private clipboard: Clipboard,
        private typeUsage:TypeUsageService
    ) { }

    async ngOnInit() {
        this.iconType = this.typeUsage.typeIcon
    }

    public async ngOnChanges() {
        this.routes = await this.api.getRoutes();
        this.initialization()
        console.log(this.scheme)
    }

    /**
     * @description
     * Init paramValue and presentRequiredParams dict, CanSubmit and retrieve routes 
     */
    public initialization() {
        this.paramsValue = {};
        this.presentRequiredParams = {};
        if (this.scheme) {
            for (let key in this.scheme['params']) {
                if (this.scheme['params'][key]['default']) {
                    this.paramsValue[key] = this.scheme['params'][key]['default'];
                    if (this.scheme['params'][key]['required']) {
                        this.presentRequiredParams[key] = true;
                    }
                } else if (this.scheme['params'][key]['type'] == 'boolean' && this.scheme['params'][key]['required']) {
                    this.paramsValue[key] = false;
                    this.presentRequiredParams[key] = true;
                } else {
                    if (this.scheme['params'][key]['required']) {
                        this.presentRequiredParams[key] = false;
                    }
                }
            }
            this.filtered_routes = this.filterRoute()
            this.updateCanSubmit();
        }
        this.updateCanSubmit()
    }

    /**
     * @description
     * filter this.route by taking only routes that mention current_controller
     * 
     * @returns the filtered array
     */
    public filterRoute():any {
        let res:{[id:string]:any} = {}
        let content:string
        let lookup = "?"+this.controller_type+"="+this.current_controller
        for (let key in this.routes) {
            for (let method in this.routes[key]['methods']) {
                content = this.routes[key]['methods'][method]['operation']
                if(content.includes(lookup)) {
                    if(res[key] === undefined) {
                        res[key] = {'methods' : {} }
                        res[key]['methods'][method] = this.routes[key]['methods'][method]
                    } else {
                        res[key]['methods'][method] = this.routes[key]['methods'][method]
                    }
                }
            }
        }
        return res
    }

    /**
     * @description
     * Send to parent the name of the new element to display if this.moving is true
     * 
     * @param ev identifier of the element to display
     */
    public sendTo(ev:string) {
        if(this.moving) this.goto.emit(ev);
    }

    /**
     * @returns html code of the response header contained in this.scheme
     */
    get requestString() {
        return prettyPrintJson.toHtml(this.scheme['response'])
    }

    /**
     * @return param list of the controller (contained in this.scheme)
     */
    get params(): { type: string, description: string, required: boolean } {
        return this.scheme['params']
    }

    /**
     * @returns the cli command associated to the controller and user input (user input => this.paramsValue)
     */
    get cliCommand():string {
        let controllerNameUnderscore = this.current_controller.replace('\\', '_');
        let stringParams = './equal.run --' + this.controller_type + "=" + controllerNameUnderscore;
        for (let key in this.paramsValue) {
            if (isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                stringParams += ' --' + key + '=\'' + arrayString + '\'';
            } else if (isObject(this.paramsValue[key])) {
                stringParams += ' --' + key + '=\'' + JSON.stringify(this.paramsValue[key]) + '\'';
            } else if (isString(this.paramsValue[key])) {
                stringParams += ' --' + key + '=' + (this.paramsValue[key].replace('\\', '\\\\'));
            } else {
                stringParams += ' --' + key + '=' + this.paramsValue[key];
            }
        }
        return stringParams
    }

    /**
     * @returns the access(public|protected|private) value (if exist) contained in this.scheme
     */
    get AccessString(): string | undefined {
        var result = ""
        if (this.scheme['access'] === undefined) return undefined
        if (this.scheme['access']['visibility'] !== undefined) result += "visibility : " + this.scheme['access']['visibility'] + '\n'
        if (this.scheme['access']['groups'] !== undefined) result += "groups : <br>" + prettyPrintJson.toHtml(this.scheme['access']['groups']) + '\n'
        return result
    }

    /**
     * @returns the url of the REST API associated to the controller and user input (user input => this.paramsValue)
     */
    get baseRoute() {
        /*var result = "http://equal.local?"+ this.controller_type +"="+this.current_controller
        for( let item in this.scheme['params']) {
            result += "&"+item+"=["+this.scheme['params'][item]['type']+"]"
        }
        return result*/
        let controllerNameUnderscore = this.current_controller.replace('\\', '_');
        let stringParams = 'http://equal.local?' + this.controller_type + "=" + controllerNameUnderscore;
        for (let key in this.paramsValue) {
            if (isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                stringParams += '&' + key + '=\'' + arrayString + '\'';
            } else if (isObject(this.paramsValue[key])) {
                stringParams += '&' + key + '=\'' + JSON.stringify(this.paramsValue[key]) + '\'';
            } else if (isString(this.paramsValue[key])) {
                stringParams += '&' + key + '=' + (this.paramsValue[key]);
            } else {
                stringParams += '&' + key + '=' + this.paramsValue[key];
            }
        }
        return stringParams
    }

    public getType(value: any) {
        return this.scheme['params'][value].type;
    }

    public getUsage(value: any):string {
        if(!this.scheme['params'][value].usage) return ""
        return this.scheme['params'][value].usage;
    }

    public getDefault(value: any) {
        return this.scheme['params'][value].default;
    }

    public getDescription(key: any) {
        return this.scheme['params'][key].description;
    }

    public getSelection(key: any) {
        return this.scheme['params'][key].selection;
    }

    public isRequired(key: any) {
        return this.scheme['params'][key].required ? true : false;
    }

    public getParamsValue(key: any) {
        return this.paramsValue[key];
    }

    /**
     * @description
     * update a field of this.paramsValue (also update presentRequiredParams and CanSubmit consequently)
     * @param new_value new value of the dield to update
     * @param params_name field to update
     */
    public updateParamsValue(new_value: any, params_name: any) {
        console.log(new_value)
        if (new_value === undefined || new_value === "") {
            delete this.paramsValue[params_name];
            if (this.scheme['params'][params_name]['required']) {
                this.presentRequiredParams[params_name] = false;
            }
        } else {
            this.paramsValue[params_name] = new_value;
            if (this.scheme['params'][params_name]['required']) {
                this.presentRequiredParams[params_name] = true;
            }
        }

        console.warn(this.paramsValue);
        this.updateCanSubmit();
    }

    public updateCanSubmit() {
        if (Object.keys(this.presentRequiredParams).length === 0) {
            this.canSubmit = true;
        } else {
            if (Object.values(this.presentRequiredParams).includes(false)) {
                this.canSubmit = false;
            } else {
                this.canSubmit = true;
            }
        }
    }

    public getEntity() {
        return this.paramsValue['entity'];
    }

    public async submit() {
        let response = await this.api.submitController(this.controller_type, this.current_controller, this.paramsValue);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.maxHeight = '86vh';
        dialogConfig.minWidth = '70vw';
        dialogConfig.closeOnNavigation = true;
        dialogConfig.position = {
            'top': '12vh'
        };
        const dialogRef = this.dialog.open(ResponseComponentSubmit, dialogConfig);
        console.log(response)
        dialogRef.componentInstance.data = response;
    }

    public cpyCLI() {
        let success = this.clipboard.copy(this.cliCommand);
        this.successCopyClipboard(success);
    }

    public cpyRequest() {
        let success = this.clipboard.copy(this.baseRoute);
        this.successCopyClipboard(success);
    }

    public successCopyClipboard(success: boolean) {
        if (success) {
            this.snackBar.open('Successfully copy', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        } else {
            this.snackBar.open('Failed to copy to clipboard', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }
    }

    nav(choice:number) {
        this.navigate.emit(choice)
    }
}
