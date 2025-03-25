import { OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

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

    public schema:any = {};
    public fields: string[] = [];
    metaData: any;
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

    public good_field:any;

    constructor(
            private workbenchService: WorkbenchService,
            private router: Router,
        ) { }

    public ngOnInit() {
        console.log(this.model);
        this.loading = true;
        this.load();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if(changes.model) {
            this.load();
        }
    }

    private load() {
        this.loading = true;
        this.workbenchService.getSchema(this.model.package_name + '\\' + this.model.name).subscribe((data) => {
            this.schema = data;
            this.fields = Object.keys(this.schema['fields']);
            this.loading = false;
            this.metaData =[
                { icon: 'description', tooltip: 'File path', value: this.model.file , copyable: true },
                { icon: 'fork_right', tooltip: 'Extends', value: this.schema['parent'] },
                { icon: 'grid_on', tooltip: 'DB_table', value: this.schema['table'], copyable: true },
                ]
        });
    }

    public onclickFields() {
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/fields']);
    }

    public onclickViews() {
        this.router.navigate(['/package/' + this.model.package_name+'/model/' + this.model.name + '/views']);
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
}