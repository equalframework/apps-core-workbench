import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { prettyPrintJson } from 'pretty-print-json';
import { MatDialog } from '@angular/material/dialog';
import { InitValidatorComponent } from './_components/init-validator/init-validator.component';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

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
    public consistency_loading = false;
    public want_errors:boolean = true;
    public want_warning:boolean = true;
    public consistency_checked = false;

    public loading: boolean = false;

    constructor(
            private snackBar: MatSnackBar,
            private router: Router,
            private workbenchService: WorkbenchService,
            private matDialog: MatDialog
        ) { }

        ngOnInit(): void {
            this.current_initialized = this.package_init_list.includes(this.package.name);
        }

        ngOnChanges(changes: SimpleChanges): void {
            if (changes.package) {
                this.resetConsistencyState();
            }
        }

        private resetConsistencyState(): void {
            this.consistency_loading = false;
            this.warn_count = 0;
            this.error_count = 0;
            this.error_list = [];
            this.consistency_checked = false;

        }

        checkConsistency(): void {
            this.consistency_loading = true;
            this.workbenchService.getPackageConsistency(this.package.name).pipe(
                tap((consistency: any) => {
                    console.log('Received consistency data:', consistency);
                    this.package_consistency = consistency;
                    this.processConsistencyResults();
                    return consistency;
                }),
                catchError(error => {
                    console.error('Error fetching package consistency:', error);
                    this.snackBar.open('Error fetching package consistency', 'Close', { duration: 3000 });
                    return of(null);
                }),
                finalize(() => {
                    this.consistency_loading = false;
                    this.consistency_checked = true;
                })
            ).subscribe();
        }


        private processConsistencyResults(): void {
            this.warn_count = 0;
            this.error_count = 0;
            this.error_list = [];

            if (!this.package_consistency?.result) return;

            this.package_consistency.result.forEach((message: string) => {
                if (message.startsWith("WARN")) {
                    this.error_list.push({ type: 1, text: message });
                    this.warn_count++;
                } else if (message.startsWith("ERROR")) {
                    this.error_list.push({ type: 2, text: message });
                    this.error_count++;
                }
            });

            this.snackBar.open(`Consistency check complete: ${this.error_count} errors, ${this.warn_count} warnings`, 'Close', { duration: 3000 });
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
        this.router.navigate(['/package/' + this.package.name+'/models']);
    }

    public onclickControllers() {
        this.router.navigate(['/package/' + this.package.name+'/controllers']);
    }

    public onclickViews() {
        this.router.navigate(['/package/' + this.package.name+'/views']);
    }

    public onclickRoutes() {
        this.router.navigate(['/package/' + this.package.name+'/routes']);
    }

    public onclickInitData(type: string) {
        this.router.navigate(['/package/' + this.package.name + '/init-data/'+ type]);
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
                let x = await this.workbenchService.InitPackage(this.package.name, result.import, result.csd, result.impcsd).toPromise()
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
