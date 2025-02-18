import { EqualComponentsProviderService } from './../../in/_services/equal-components-provider.service';
import { Component, Input, OnChanges, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';


@Component({
    selector: 'info-view',
    templateUrl: './info-view.component.html',
    styleUrls: ['./info-view.component.scss']
})
export class InfoViewComponent implements OnInit, OnChanges {
    @Input() view: EqualComponentDescriptor;

    public loading: boolean = true;

    public view_id: string;
    public entity: string;

    public view_schema: any;
    public fields: any;

    constructor(
            private router: Router,
            private api: WorkbenchService,
            private provider: EqualComponentsProviderService) {
    }

    public ngOnInit() {
        this.loading = true;
        this.load();
    }

    async ngOnChanges(changes: SimpleChanges) {
        if(changes.view) {
            this.load();
        }
    }

    private async load() {
        this.loading = true;
        try {
            this.entity = `${this.view.package_name}\\${this.view.item.model}`;
            this.view_id = this.view.name;
            this.view_schema = this.provider.getComponents(this.view.package_name, "view", this.view.item.model);
            this.fields = this.getFields(this.view_schema);
        }
        catch(response) {
            console.log('unexpected error - restricted visibility?', response);
        }
        this.loading = false;
    }

    public onclickEdit() {
        console.log("view ", this.view);
        this.router.navigate(['/package/' + this.view.package_name + '/view/' + this.view.name]);
    }

    public onclickTranslations() {
        // #todo - depends on route assigned to translation
        this.router.navigate([`/package/${this.view.package_name}/model/${this.view.item.model}/translations`]);
    }

    private getFields(schema: any): any {
        let mapFields: any = {};
        let items: Array<any> = [];

        for(let group of schema.layout?.groups ?? []) {
            for(let section of group.sections) {
                for(let row of section.rows) {
                    for(let column of row.columns) {
                        for(let item of column.items) {
                            if(item.type == 'field') {
                                items.push(item);
                            }
                        }
                    }
                }
            }
        }

        for(let item of this.view_schema.layout?.items ?? []) {
            if(item.type == 'field') {
                items.push(item);
            }
        }

        for(let item of items) {
            if(item.type == 'field') {
                mapFields[item.value] = item;
            }
        }

        return mapFields;
    }

    public getFieldsCount(): number {

        return Object.keys(this.fields).length;
    }
}
