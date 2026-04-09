import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { RequestSendingDialogComponent } from 'src/app/_dialogs/request-sending-dialog/request-sending-dialog.component';
import { TypeUsageService } from 'src/app/_services/type-usage.service';
import { EnvService } from 'sb-shared-lib';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

@Component({
    selector: 'info-controller',
    templateUrl: './info-controller.component.html',
    styleUrls: ['./info-controller.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})


/**
 * @description
 * This component is used to display information about controllers on the right of a search list.
 *
 * @Input controller_name name of the controller to display
 * @Input controller_type type of the controller to display ('do' or 'get')
 * @Input scheme : announcement of the controller to display
 * @Input selected_package : package of controller_name
 * @Input fetch_error : indicate if the announce has been successfully fetched or not
 * @Input moving : indicate if navigation between type of element is possible (with goto)
 *
 * @Output goto : return an identifier for displaying a new element (here : a route)
 *
 * @attribute paramsValue : dict that hold value of params entered by the user
 * @attribute presentRequiredParams : dict containing boolean indicating if a param is valid
 * @attribute canSubmit : indicate if the user is able to submit the action
 * @attribute routes : list of all defined route of the equal instance
 * @attribute filtered_routes : list of all defined route of the equal instance that mention controller_name
 */
export class InfoControllerComponent implements OnInit, OnChanges {

    @Input() controller?: EqualComponentDescriptor;

    public controller_name: string;
    public controller_type: string;
    public controller_package: string;

    @Input() selected_package: string;

    @Input() fetch_error:boolean;
    @Input() moving:boolean = false;

    public announcement: any = {};
    public schema: any = {};
    private controllerProperties: EqualComponentDescriptor | null = null;
    public metaData: {
        icon: string;
        tooltip: string;
        value: string;
        copyable?: boolean;
        double_backslash?:boolean
      }[];

        public validationStatus: ValidationStatusInfo[] = [];

    public loading: boolean = true;



    public iconType: any;

    public paramsValue: any = {};
    public presentRequiredParams: any;
    public canSubmit: boolean;
    public routes: { [id: string]: any };
    public filtered_routes: { [id: string]: any } = {};

    public tojsonstring = JSON.stringify;
    public obk = Object.keys;

    public viewMode: 'json' | 'edit' = 'edit';

    private environment: any;
    private lastLoadedController: string;

    public get headerStatus(): { icon?: string, tooltip?: string, label: string, value: string }[] {
        const deprecatedLabel = this.announcement?.deprecated ? 'This controller is marked as deprecated, and shouldn\'t be used anymore.' : '';
        const visibilityLabel = this.announcement?.access?.visibility === 'private' ? 'This controller has its visibility set to "private" or you don\'t have the rights to invoke it.' : '';
        if (!deprecatedLabel && !visibilityLabel) {
            return [];
        } else if (deprecatedLabel && !visibilityLabel) {
            return [{ label: 'Deprecated', value: deprecatedLabel, icon: 'warning' }];
        } else if (!deprecatedLabel && visibilityLabel) {
            return [{ label: 'Visibility', value: visibilityLabel, icon: this.announcement?.access?.visibility === 'private' ? 'lock' : 'public' }];
        } else {
        return [
            { label: 'Deprecated', value: deprecatedLabel, icon: this.announcement?.deprecated ? 'warning' : '' },
            { label: 'Visibility', value: visibilityLabel, icon: this.announcement?.access?.visibility === 'private' ? 'lock' : 'public' }
        ];}
    }

    public get combinedStatus(): { icon?: string, tooltip?: string, label: string, value: string }[] {
        const hasSchema = !!this.schema && Object.keys(this.schema).length > 0;
        if ([...this.headerStatus, ...this.validationStatus].length === 1 && !hasSchema) {
            return [{ icon: 'error', label: 'Error fetching', value: 'Unknown error occurred', tooltip: 'An error occurred while fetching the controller information. This might be due to restricted visibility or an unexpected issue.' }];
        }
        if (!hasSchema) {
            return this.headerStatus;
        }
        return [...this.headerStatus, ...this.validationStatus];
    }

    constructor(
            private snackBar: MatSnackBar,
            private workbenchService: WorkbenchService,
            private jsonValidationService: JsonValidationService,
            public dialog: MatDialog,
            private router: RouterMemory,
            private clipboard: Clipboard,
            private typeUsage: TypeUsageService,
            private env: EnvService,
            private provider: EqualComponentsProviderService
        ) { }

    private isObject(value: any): value is object {
        return typeof value === 'object' && !Array.isArray(value) && value !== null;
    }

    public async ngOnInit() {
        this.iconType = this.typeUsage.typeIcon;
        this.environment = await this.env.getEnv();

    }

    public async ngOnChanges(changes: SimpleChanges) {
        if(changes.controller) {
            this.controller_name = this.controller?.name ?? '';
            this.controller_type = this.controller?.type ?? '';
            this.controller_package = this.controller?.package_name ?? '';
            this.load();
        }
    }

    private async load() {
        if(!this.controller) {
            return;
        }

        const controllerKey = `${this.controller.package_name}_${this.controller.name}_${this.controller.type}`;

        // Skip if we just loaded this same controller
        if(controllerKey === this.lastLoadedController) {
            return;
        }

        this.lastLoadedController = controllerKey;
        this.loading = true;
        try {
            const operation_name = this.controller.name;
            const [response, properties] = await Promise.all([
                this.workbenchService.announceController(this.controller.type, this.controller_package + '_' + operation_name).toPromise(),
                this.provider.getComponent(this.controller_package, 'controller', '', this.controller.name).toPromise()
            ]);
            this.controllerProperties = properties ?? this.controller ?? null;
            this.metaData =[
                { icon: 'key', tooltip: 'ID', value: this.controller_name, copyable:true },
                ]
            this.announcement = response?.announcement ?? null;
            
            this.schema = this.announcement ?? {};
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
            this.initialization();
            if (this.announcement) {
                this.validateSchema();
            }
        }
        catch(response) {
            this.announcement = null;
            this.controllerProperties = null;
            this.schema = null;
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load controller schema');
        }
        // #memo - all controllers are expected to be open source, so there is no point in rejecting announce for private controllers
        this.loading = false;
    }

    private validateSchema(): void {
        const controllerDocument = this.getControllerDocument();
        if (!controllerDocument) {
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to build controller payload');
            return;
        }
        this.jsonValidationService.validate(
            controllerDocument,
            'urn:equal:json-schema:core:controller',
            this.controller_package
        ).subscribe((result) => {
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
        });
    }

    /**
     * @description
     * Init paramValue and presentRequiredParams dict, CanSubmit and retrieve routes
     */
    public initialization() {
        this.paramsValue = {};
        this.presentRequiredParams = {};

        if(this.announcement) {
            for(let key in this.announcement['params']) {
                if(this.announcement['params'][key]['default']) {
                    this.paramsValue[key] = this.announcement['params'][key]['default'];
                    if(this.announcement['params'][key]['required']) {
                        this.presentRequiredParams[key] = true;
                    }
                }
                else if(this.announcement['params'][key]['type'] == 'boolean' && this.announcement['params'][key]['required']) {
                    this.paramsValue[key] = false;
                    this.presentRequiredParams[key] = true;
                }
                else {
                    if(this.announcement['params'][key]['required']) {
                        this.presentRequiredParams[key] = false;
                    }
                }
            }
            this.filtered_routes = this.filterRoute();
        }
        this.updateCanSubmit();

    }

    /**
     * @description
     * filter this.route by taking only routes that mention controller_name
     *
     * @returns the filtered array
     */
    public filterRoute():any {
        let res:{[id:string]:any} = {}
        let content:string
        let lookup = "?"+this.controller_type+"="+this.controller_name
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

    }

    /**
     * @returns html code of the response header contained in this.announcement
     */
    public getRequestString() {
        return prettyPrintJson.toHtml(this.announcement?.response ?? '');
    }

    /**
     * @return param list of the controller (contained in this.announcement)
     */
    get params(): { type: string, description: string, required: boolean } {
        return this.announcement['params']
    }

    /**
     * @returns the cli command associated to the controller and user input (user input => this.paramsValue)
     */
    get cliCommand(): string {
        let controllerNameUnderscore = this.controller_name.replace('\\', '_');
        let stringParams = './equal.run --' + this.controller_type + "=" + this.controller_package + '_' + controllerNameUnderscore;
        for (let key in this.paramsValue) {
            if (Array.isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                stringParams += ' --' + key + '=\'' + arrayString + '\'';
            }
            else if (this.isObject(this.paramsValue[key])) {
                stringParams += ' --' + key + '=\'' + JSON.stringify(this.paramsValue[key]) + '\'';
            }
            else if (typeof this.paramsValue[key] === 'string') {
                stringParams += ' --' + key + '=' + (this.paramsValue[key].replace('\\', '\\\\'));
            }
            else {
                stringParams += ' --' + key + '=' + this.paramsValue[key];
            }
        }
        return stringParams;
    }

    /**
     * @returns the access(public|protected|private) value (if exist) contained in this.schema
     */
    public getAccessString(): string {
        var result = '';
        if(this.announcement?.access) {
            if(this.announcement.access?.visibility) {
                result += "<div>visibility: " + this.announcement.access.visibility + '</div>';
            }
            if(this.announcement.access?.groups) {
                result += "<div>groups: " + prettyPrintJson.toHtml(this.announcement.access.groups) + '</div>';
            }
        }
        return result;
    }

    /**
     * @returns the url of the REST workbenchService associated to the controller and user input (user input => this.paramsValue)
     */
    public getBaseRoute(): string {
        let result = '';
        let controller_name = this.controller?.name.replace('\\', '_');

        result = this.environment.backend_url + '?' + this.controller?.type + "=" + this.controller_package + '_' + controller_name;
        for (let key in this.paramsValue) {
            if(Array.isArray(this.paramsValue[key])) {
                let arrayString = (JSON.stringify(this.paramsValue[key])).replaceAll('"', '');
                result += '&' + key + '=\'' + arrayString + '\'';
            }
            else if(this.isObject(this.paramsValue[key])) {
                result += '&' + key + '=\'' + JSON.stringify(this.paramsValue[key]) + '\'';
            }
            else if(typeof this.paramsValue[key] === 'string') {
                result += '&' + key + '=' + (this.paramsValue[key]);
            }
            else {
                result += '&' + key + '=' + this.paramsValue[key];
            }
        }
        return result;
    }

    public getType(value: any) {
        return this.announcement['params'][value].type;
    }

    public getUsage(value: any):string {
        if(!this.announcement['params'][value].usage) return ""
        return this.announcement['params'][value].usage;
    }

    public getDefault(value: any) {
        return this.announcement['params'][value].default;
    }

    public getDescription(key: any) {
        return this.announcement['params'][key].description;
    }

    public getSelection(key: any) {
        return this.announcement['params'][key].selection;
    }

    public isRequired(key: any) {
        return this.announcement['params'][key].required ? true : false;
    }

    public getParamsValue(key: any) {
        return this.paramsValue?.key;
    }

    public getParamName(key: any): string {
        return (this.paramsValue?.key) ? key : '';
    }

    /**
     * @description
     * update a field of this.paramsValue (also update presentRequiredParams and CanSubmit consequently)
     * @param new_value new value of the dield to update
     * @param params_name field to update
     */
    public updateParamsValue(new_value: any, params_name: any) {
        if (new_value === undefined || new_value === "") {
            delete this.paramsValue[params_name];
            if (this.announcement['params'][params_name]['required']) {
                this.presentRequiredParams[params_name] = false;
            }
        }
        else {
            this.paramsValue[params_name] = new_value;
            if (this.announcement['params'][params_name]['required']) {
                this.presentRequiredParams[params_name] = true;
            }
        }

        this.updateCanSubmit();
    }

    public updateCanSubmit() {
        if (Object.keys(this.presentRequiredParams).length === 0) {
            this.canSubmit = true;
        } else {
            if (Object.values(this.presentRequiredParams).includes(false)) {
                this.canSubmit = false;
            }
            else {
                this.canSubmit = true;
            }
        }
    }

    public getEntity() {
        return this.paramsValue['entity'];
    }

    public async submit() {
        if(!this.controller) {
            return;
        }
        const operation_name = this.controller.package_name + '_' + this.controller.name;
        const response = await this.workbenchService.submitController(this.controller.type, operation_name, this.paramsValue).toPromise();
        const dialogConfig = new MatDialogConfig();
        dialogConfig.maxHeight = '86vh';
        dialogConfig.minWidth = '70vw';
        dialogConfig.closeOnNavigation = true;
        dialogConfig.position = {
            'top': '12vh'
        };
        const dialogRef = this.dialog.open(RequestSendingDialogComponent, dialogConfig);
        dialogRef.componentInstance.data = response;
    }

    public cpyCLI() {
        let success = this.clipboard.copy(this.cliCommand);
        this.successCopyClipboard(success);
    }

    public async cpyRequest() {
        let success = this.clipboard.copy(await this.getBaseRoute());
        this.successCopyClipboard(success);
    }

    public successCopyClipboard(success: boolean) {
        if (success) {
            this.snackBar.open('Successfully copied to clipboard', '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        } else {
            this.snackBar.open('Unable to copy to clipboard', 'ERROR', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            });
        }
    }

    public onclickRequestParams() {
        this.router.navigate(['/package/'+this.controller_package+'/controller/'+this.controller_type+'/'+this.controller_name+'/edit']);
    }

    public onclickTranslations() {
        console.log('Not implemented yet');
        /*
        this.router.navigate(['/package/'+this.controller_package+'/controller/'+this.controller_type+'/'+this.controller_name+'/translations']);
        */
    }

    public toggleViewMode(mode: 'json' | 'edit') {
        this.viewMode = mode;
    }

    private getControllerDocument(): any | null {
        if (!this.controllerProperties || !this.announcement) {
            return null;
        }

        return {
            ...this.controllerProperties,
            announcement: this.announcement
        };
    }

    public getControllerJson() {
        return prettyPrintJson.toHtml(this.getControllerDocument() ?? {});
    }

    public cpyControllerJson() {
        const jsonObj = this.getControllerDocument() ?? {};
        let success = this.clipboard.copy(JSON.stringify(jsonObj, null, 2));
        this.successCopyClipboard(success);
    }
}
