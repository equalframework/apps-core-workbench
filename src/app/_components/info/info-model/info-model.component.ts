import { OnChanges, SimpleChanges, ViewEncapsulation, ViewChild } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { InfoSubHeaderButton } from '../info-sub-header/info-sub-header.component';
import { MatSort, Sort } from '@angular/material/sort';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';
import { InstallationPathService } from 'src/app/in/_services/installation-path.service';

@Component({
    selector: 'info-model',
    templateUrl: './info-model.component.html',
    styleUrls: ['./info-model.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})

/**
 * @description
 * Component used to display information about a model aside with a list of model
 */
export class InfoModelComponent implements OnInit, OnChanges {
    @Input() model: any;

    @Output() changeStep = new EventEmitter<number> ();
    @Output() getRef = new EventEmitter<{package?:string, name:string, type:string, more?:any}> ();

    public loading: boolean = true;

    @ViewChild(MatSort) sort: MatSort;

    public schema:any = {};
    public fields: string[] = [];
    public sortedFields: string[] = [];
    metaData: any;
    public validationStatus: ValidationStatusInfo[] = [];
    public iconList: { [id: string]: string } = {
        'string':       'format_quote',
        'integer':      '123',
        'array':        'data_array',
        'float':        'money',
        'boolean':      'question_mark',
        'computed':     'functions',
        'alias':        'type_specimen',
        'binary':       'looks_one',
        'date':         'today',
        'datetime':     'event',
        'time':         'access_time',
        'text':         'article',
        'many2one':     'call_merge',
        'one2many':     'call_split',
        'many2many':    'height'
    };

    public obk = Object.keys;
    
    public navigationButtons: InfoSubHeaderButton[] = [];
    public actionButtons: InfoSubHeaderButton[] = [];

    public good_field:any;

    constructor(
            private workbenchService: WorkbenchService,
            private router: RouterMemory,
            private jsonValidationService: JsonValidationService,
            private installationPathService: InstallationPathService,
        ) { }

    public ngOnInit() {
        this.loading = true;
        // this.load();
        this.buildNavigationButtons();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if(changes.model) {
            this.load();
            this.buildNavigationButtons();
        }
    }

    private buildNavigationButtons(): void {
        const pkg = this.model?.package_name || '';
        this.navigationButtons = [
            { label: 'Views', icon: 'view_quilt' }
        ];
        this.actionButtons = [
            { label: 'Workflows', icon: 'call_split' },
            { label: 'Roles', icon: 'question_mark' },
            { label: 'Policies', icon: 'policy' },
            { label: 'Actions', icon: 'shortcut' }
        ];
    }

    public onSubHeaderNavigation(btn: InfoSubHeaderButton) {
        const label = (btn && btn.label) || '';
        switch (label) {
            case 'Fields':
                this.onclickFields();
                break;
            case 'Views':
                this.onclickViews();
                break;
            case 'Translations':
                this.onclickTranslations();
                break;
            case 'Workflows':
                this.onclickWorkflow();
                break;
            case 'Roles':
                this.onclickRoles();
                break;
            case 'Policies':
                this.onclickPolicies();
                break;
            case 'Actions':
                this.onclickActions();
                break;
            default:
                break;
        }
    }

    private load() {
        const modelKey = this.model.package_name + '\\' + this.model.name;
        this.loading = true;
        
        this.workbenchService.getSchema(modelKey).subscribe((data) => {
            this.schema = data;
            this.fields = Object.keys(this.schema['fields']);
            this.sortedFields = [...this.fields];
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
            this.validateSchema();
            this.loading = false;
            this.metaData =[
                { icon: 'description', tooltip: 'File path', value: this.installationPathService.normalizeInstallationPath(this.getPath()).slice(0, -1) || '', copyable: true },
                { icon: 'fork_right', tooltip: 'Extends', value: this.schema['parent'] },
                { icon: 'grid_on', tooltip: 'DB_table', value: this.schema['table'], copyable: true },
            ]
        });
    }

    private validateSchema(): void {
        this.jsonValidationService.validate(
            this.schema,
            'urn:equal:json-schema:core:model',
            this.model?.package_name
        ).subscribe((result) => {
            this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
        });
    }

    public sortData(sort: Sort): void {
        if (!sort.active || sort.direction === '') {
            this.sortedFields = [...this.fields];
            return;
        }
        this.sortedFields = [...this.fields].sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const fa = this.schema['fields'][a];
            const fb = this.schema['fields'][b];
            switch (sort.active) {
                case 'name':           return this.compare(a, b, isAsc);
                case 'type':           return this.compare(fa['type'] || '', fb['type'] || '', isAsc);
                case 'description':    return this.compare(fa['description'] || '', fb['description'] || '', isAsc);
                case 'usage':          return this.compare(fa['usage'] || '', fb['usage'] || '', isAsc);
                case 'foreign_object': return this.compare(fa['foreign_object'] || '', fb['foreign_object'] || '', isAsc);
                default: return 0;
            }
        });
    }

    private compare(a: string, b: string, isAsc: boolean): number {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    public onclickFields() {
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/fields']);
    }

    public onclickViews() {
        this.router.navigate([`/package/${this.model.package_name}/model/${this.model.name}`], {
            queryParams: {
                scope: 'view',
                filter_model: this.model.name
            }
        });
}

    public onclickTranslations() {
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/translations']);
    }

    public onclickWorkflow() {
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/workflow']);
    }

    onclickPolicies(){
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/policies']);
    }

    onclickActions(){
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/actions']);
    }

    onclickRoles(){
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/roles']);

    }
    /**
     * @description
     * Looks for properties about a field of the model
     * @param key name of the field
     * @returns true if this field has at least one property, false else
     */
    public fieldHasProp(key:string):boolean {
        return (this.schema['fields'][key]['required']
            || this.schema['fields'][key]['readonly']
            || this.schema['fields'][key]['multilang']
            || this.schema['fields'][key]['unique']);
    }

    /**
     *  @description
     *  Simple Getter of the number of field
     * @returns field list length
     */
    public get fieldNumber(): number
    {
        return this.obk(this.schema['fields']).length;
    }

    public getref(name: string) {
        let x = name.split('\\');
        this.getRef.emit({package:x[0],name:x.slice(1).join('\\'),type:'class'});
    }

    public getPath(): string {
        return this.installationPathService.getCurrentInstallationPath() + 'packages/' + this.model.package_name + '/classes/' + this.model.name + '.class.php';
    }
}