import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { isArray, isObject, isString } from 'lodash';
import { ControllersService } from '../../_service/controllers.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { ResponseComponentSubmit } from '../router-property/_components/params/_components/response/response.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-controller-info',
    templateUrl: './controller-info.component.html',
    styleUrls: ['./controller-info.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ControllerInfoComponent implements OnInit {

    @Input() current_controller: string;
    @Input() controller_type: string;
    @Input() scheme: any;
    @Input() selected_package: string;
    @Output() goto = new EventEmitter<number>();
    public paramsValue: any;
    public presentRequiredParams: any;
    public canSubmit: boolean
    public routes: {[id:string]:any}
    public filtered_routes: {[id:string]:any}
    public obk = Object.keys

    constructor(
        private snackBar: MatSnackBar,
        private api: ControllersService,
        public dialog: MatDialog,
        private clipboard: Clipboard,
    ) { }

    async ngOnInit() {
    }

    public async ngOnChanges() {
        this.routes = await this.api.getRoutes();
        this.initialization()
    }

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
                this.filtered_routes = this.filterRoute()
                console.log(this.obk(this.filtered_routes))
                this.updateCanSubmit();
            }
        }
    }

    public filterRoute():any {
        let res:{[id:string]:any} = {}
        let content:string
        let lookup = "?"+this.controller_type+"="+this.selected_package+"_"+this.current_controller
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

    public clickEdit() {
        console.log("emit")
        this.goto.emit(2)
    }

    get requestString() {
        return prettyPrintJson.toHtml(this.scheme['response'])
    }

    get params(): { type: string, description: string, required: boolean } {
        return this.scheme['params']
    }

    get cliCommand() {
        let controllerNameUnderscore = this.current_controller.replace('\\', '_');
        let stringParams = './equal.run --' + this.controller_type + "=" + this.selected_package + '_' + controllerNameUnderscore;
        for (let key in this.paramsValue) {
            if (isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                console.log(arrayString)
                stringParams += ' --' + key + '=\'' + arrayString + '\'';
            } else if (isObject(this.paramsValue[key])) {
                stringParams += ' --' + key + '=\'{' + this.paramsValue[key] + '}\'';
            } else if (isString(this.paramsValue[key])) {
                stringParams += ' --' + key + '=' + (this.paramsValue[key].replace('\\', '\\\\'));
            } else {
                stringParams += ' --' + key + '=' + this.paramsValue[key];
            }
        }
        return stringParams
    }

    get AccessString(): string | undefined {
        var result = ""
        if (this.scheme['access'] === undefined) return undefined
        if (this.scheme['access']['visibility'] !== undefined) result += "visibility : " + this.scheme['access']['visibility'] + '\n'
        if (this.scheme['access']['groups'] !== undefined) result += "groups : <br>" + prettyPrintJson.toHtml(this.scheme['access']['groups']) + '\n'
        return result
    }

    get baseRoute() {
        /*var result = "http://equal.local?"+ this.controller_type +"="+this.current_controller
        for( let item in this.scheme['params']) {
            result += "&"+item+"=["+this.scheme['params'][item]['type']+"]"
        }
        return result*/
        let controllerNameUnderscore = this.current_controller.replace('\\', '_');
        let stringParams = 'http://equal.local?' + this.controller_type + "=" + this.selected_package + '_' + controllerNameUnderscore;
        for (let key in this.paramsValue) {
            if (isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                console.log(arrayString)
                stringParams += '&' + key + '=\'' + arrayString + '\'';
            } else if (isObject(this.paramsValue[key])) {
                stringParams += '&' + key + '=\'{' + this.paramsValue[key] + '}\'';
            } else if (isString(this.paramsValue[key])) {
                stringParams += '&' + key + '=' + (this.paramsValue[key].replace('\\', '\\\\'));
            } else {
                stringParams += '&' + key + '=' + this.paramsValue[key];
            }
        }
        return stringParams
    }

    public getType(value: any) {
        return this.scheme['params'][value].type;
    }

    public getUsage(value: any) {
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

    public updateParamsValue(new_value: any, params_name: any) {
        if (new_value == undefined) {
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
        if (Object.keys(this.presentRequiredParams).length == 0) {
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
        console.log(this.paramsValue);
        let response = await this.api.submitController(this.controller_type, this.selected_package, this.current_controller, this.paramsValue);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.maxHeight = '86vh';
        dialogConfig.minWidth = '70vw';
        dialogConfig.closeOnNavigation = true;
        dialogConfig.position = {
            'top': '12vh'
        };
        const dialogRef = this.dialog.open(ResponseComponentSubmit, dialogConfig);
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
}
