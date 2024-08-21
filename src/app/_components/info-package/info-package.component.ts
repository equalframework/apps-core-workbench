import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { prettyPrintJson } from 'pretty-print-json';
import { MatDialog } from '@angular/material/dialog';
import { InitValidatorComponent } from './_components/init-validator/init-validator.component';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
    selector: 'info-package',
    templateUrl: './info-package.component.html',
    styleUrls: ['./info-package.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})

export class InfoPackageComponent implements OnInit {

    @Input() package: EqualComponentDescriptor;

    @Input() package_init_list:string[];

    @Output() onModelClick = new EventEmitter<void>();
    @Output() onControllerClick = new EventEmitter<void>();
    @Output() onViewClick = new EventEmitter<void>();
    @Output() onRouteClick = new EventEmitter<void>();
    @Output() refresh = new EventEmitter<void>();
    @Output() onIDClick = new EventEmitter<void>();
    @Output() onIDDClick = new EventEmitter<void>();

    public package_consistency:any;
    public current_initialized = false;
    public warn_count:number;
    public error_count:number;
    public error_list:{type:number, text:string}[];
    public info_popup = true;
    public consistency_loading = true;
    public want_errors:boolean = true;
    public want_warning:boolean = true;

    public loading: boolean = true;

    constructor(
            private snackBar: MatSnackBar,
            private router: Router,
            private api: WorkbenchService,
            private matDialog: MatDialog
        ) { }

    public async ngOnInit() {
        await this.load();
    }

    public async ngOnChanges(changes: SimpleChanges) {
        if(changes.package) {
            await this.load();
        }
    }

    private async load() {
        this.loading = true;
        this.current_initialized = (this.package_init_list??[]).indexOf(this.package.name) >= 0;
        this.consistency_loading = true;
        this.api.getPackageConsistency(this.package.name).then( async (consistency) => {
                this.package_consistency = consistency;
                this.error_list = this.package_consistency["result"];
                this.countErrors();
                this.consistency_loading = false;
            });
        this.loading = false;
    }

    public countErrors() {
        this.warn_count = 0;
        this.error_count = 0;
        this.error_list = [];
        for(let i in this.package_consistency["result"]) {
            if(this.package_consistency["result"][i].startsWith("WARN")) {
                this.error_list.push({type:1,text:this.package_consistency["result"][i]});
                ++this.warn_count;
            }
            else if (this.package_consistency["result"][i].startsWith("ERROR")) {
                this.error_list.push({type:2,text:this.package_consistency["result"][i]});
                ++this.error_count;
            }
        }
    }

    public onclickModels() {
        this.router.navigate(['/package/'+this.package.name+'/models']);
    }

    public onclickControllers() {
        this.router.navigate(['/package/'+this.package.name+'/controllers']);
    }

    public onclickViews() {
        this.router.navigate(['/package/'+this.package.name+'/views']);
    }

    public onclickRoutes() {
        this.router.navigate(['/package/'+this.package.name+'/routes']);
    }

    public onclickInitData() {
        this.router.navigate(['/package/'+this.package.name+'/init-data']);
    }

    public onclickDemoData() {

    }
    public consitencyPrint():any {
        prettyPrintJson.toHtml(this.package_consistency);
    }

    public get filtered_error_list() {
        return this.error_list.filter((item) => (
            (item.text.includes("ERROR") && this.want_errors) || (item.text.includes("WARN") && this.want_warning)
        ));
    }

    public async initPackage() {
        const dialog = this.matDialog.open(InitValidatorComponent,{data:{package: this.package.name}, width:"35em"})
        dialog.afterClosed().subscribe(async (result) => {
            if(result){
                let x = await this.api.InitPackage(this.package.name, result.import, result.csd, result.impcsd)
                if(x) {
                    this.snackBar.open("Package "+this.package.name+" has been successfully initialized")
                    this.refresh.emit()
                }
                else {
                    this.snackBar.open("Error during package initialization, check package consistency for more information.")
                }
            }
        });

    }
}
