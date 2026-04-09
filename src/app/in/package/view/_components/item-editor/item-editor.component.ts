import { Component, Input, OnInit, EventEmitter, Output, OnDestroy, ElementRef } from '@angular/core';
import { ViewItem } from '../../_objects/View';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'app-item-editor',
    templateUrl: './item-editor.component.html',
    styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {
    @Input() item: ViewItem;
    @Input() entity: string;
    @Input() fields: string[];
    @Input() types: string[];
    @Input() displayDelete = false;
    @Input() groups: string[];
    @Input() actionControllers: string[];
    @Input() packageName: string;

    protected _widgetTypes: { [id: string]: string[] };
    public filteredEqualUsage: string[];

    @Output() delete = new EventEmitter<void>();

    obk = Object.keys;

    public cacheList: { foreign: string, lists: { [key: string]: string } } = { foreign: '', lists: {} };

    public scheme: any;

    get isReadonly(): boolean {
        if (this.item?.readonly) { return true; }
        if (!this.scheme || !this.scheme.fields || !this.item?.value) { return false; }
        return !!this.scheme.fields[this.item.value]?.readonly;
    }

    constructor(
        private workbenchService: WorkbenchService,
        private elementRef: ElementRef,
    ) {}


    async ngOnInit(): Promise<void> {
        const currentUrl = window.location.href;
        const packageNameMatch = currentUrl.match(/\/package\/([^/]+)\//);
        let packageName = '';
        if (packageNameMatch) {
            packageName = packageNameMatch[1];
        }
        this.workbenchService.getWidgetTypes().subscribe((data) => {
            this._widgetTypes = data;
        });
        this.workbenchService.getSchema(`${packageName}\\${this.entity}`).subscribe((data) => {
        this.scheme = data;
        });
        if (this.item.viewType === 1) {
            this.set_has_view(this.item.widgetForm._has_view);
        }
    }

    get widgetTypes(): string[] {
        if (this.item.type === 'label') {
            return [''];
        }
        if (!this.scheme || !this.scheme.fields || !this.scheme.fields[this.item.value]) {
            return [''];
        }
        const fieldType = this.scheme.fields[this.item.value].type;
        if (!Object.keys(this._widgetTypes).includes(fieldType)) {
            return [''];
        }
        return ['', ...this._widgetTypes[fieldType]];
    }

    public onDelete(): void {
        this.delete.emit();
    }

    public update_has_field(): void {
        this.set_has_view(this.item.widgetForm._has_view);
        this.set_has_domain(this.item.widgetForm._has_view);
        this.set_has_header(this.item.widgetForm._has_header);
    }

    public set_has_view($event: boolean): void {
        if (this.item.viewType !== 1) { return; }
        this.item.widgetForm._has_view = $event && this._has_viewEnabled;
        if (this.item.widgetForm._has_view) {
            this.getListOptions4View();
        }
    }

    set_has_domain($event: boolean): void {
        if (this.item.viewType !== 1) { return; }
        this.item.widgetForm._has_domain = $event && this._has_viewEnabled;
    }

    set_has_header($event: boolean): void {
        if (this.item.viewType !== 1) { return; }
        this.item.widgetForm._has_header = $event && this._has_viewEnabled;
    }

    get _has_viewEnabled(): boolean {
        if (this.item.viewType !== 1) { return false; }
        return this.item.type === 'field' && this.scheme.fields && (
            this.scheme.fields[this.item.value].type === 'many2many' ||
            this.scheme.fields[this.item.value].type === 'one2many' ||
            this.scheme.fields[this.item.value].type === 'many2one'
        );
    }

    get fieldType(): string {
        if (this.item.type === 'label') {
            return 'string';
        }
        if (!this.scheme || !this.scheme.fields || !this.scheme.fields[this.item.value]) {
            return 'string';
        }
        if (this.scheme.fields[this.item.value].type === 'computed') {
            return this.scheme.fields[this.item.value].result_type || 'string';
        }
        return this.scheme.fields[this.item.value].type || 'string';
    }

    async getListOptions4View(): Promise<void> {
        if (this.item.viewType !== 1) { return; }
        if (this._has_viewEnabled && this.scheme.fields[this.item.value].foreign_object === this.cacheList.foreign) {
            return;
        }
        const t = this.scheme.fields[this.item.value].foreign_object.split('\\');
        const x = (await this.workbenchService.collectViews(t[0], t.slice(1).join('\\')).toPromise())?.filter((value) => value.includes('list.'));
        if (x) {
            const r: { [key: string]: string } = {};
            x.forEach(list => r[list.split(':')[1]] = list);
            this.cacheList = {
                foreign: this.scheme.fields[this.item.value].foreign_object,
                lists: r,
            };
            return;
        }

        this.cacheList = {
            foreign: this.scheme.fields[this.item.value].foreign_object,
            lists: {},
        };
    }
}
