import { EventEmitter, Component, Input, OnChanges, OnInit, Output, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';

@Component({
    selector: 'info-route',
    templateUrl: './info-route.component.html',
    styleUrls: ['./info-route.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class InfoRouteComponent implements OnInit, OnChanges {

    @Input() route: EqualComponentDescriptor;
    @Output() redirect = new EventEmitter<string>();

    public loading: boolean = true;

    public methods: string[] = [];

    public routes: any = {};

    constructor(
            public dialog: MatDialog,
            public workbenchService: WorkbenchService
        ) { }

    public async ngOnInit() {
        this.routes = await this.workbenchService.getRoutesLive().toPromise();
        console.log(this.routes);
        await this.load();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if(changes.route) {
            this.load();
        }
    }

    public async load() {
        console.log(this.route);
        this.loading = true;
        this.methods = this.route ? Object.keys(this.route?.item) : [];
        this.loading = false;
    }

    public isRouteLive() {
        let result: boolean = false;
        if( this.routes.hasOwnProperty(this.route.name) &&
                this.route.file.includes(this.routes[this.route.name].info.file) ) {
            result = true;
        }

        return result;
    }

    public getRouteMethods() {
        // return Object.keys(this.route_info['methods']);
    }

    public sendTo(value:string) {
        let x = value.split('=')[1].split("&")[0];
        this.redirect.emit(x);
    }
}
