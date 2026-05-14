import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges, OnDestroy } from '@angular/core';
import { InfoSubHeaderButton } from '../info-sub-header/info-sub-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { prettyPrintJson } from 'pretty-print-json';
import { MatDialog } from '@angular/material/dialog';
import { InitValidatorComponent } from './_components/init-validator/init-validator.component';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { Observable, of, Subject } from 'rxjs';
import { catchError, finalize, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { PackageSummary } from 'src/app/in/_models/package-info.model';
import {RouterMemory} from 'src/app/_services/router-memory.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';
import { InstallationPathService } from 'src/app/in/_services/installation-path.service';

class ConsistencyResultItem {
    constructor(
        public type: number, // 1 = warning, 2 = error
        public mode: string, // DBM, ORM, I18, GUI
        public text: string,
    ) {}
}

@Component({
    selector: 'info-package',
    templateUrl: './info-package.component.html',
    styleUrls: ['./info-package.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})

export class InfoPackageComponent implements OnInit, OnDestroy {

    @Input() package: EqualComponentDescriptor;

    @Input() package_init_list:string[];

    @Input() key: string;

    @Output() onModelClick = new EventEmitter<void>();
    @Output() onControllerClick = new EventEmitter<void>();
    @Output() onViewClick = new EventEmitter<void>();
    @Output() onRouteClick = new EventEmitter<void>();
    @Output() refresh = new EventEmitter<void>();
    @Output() onIDClick = new EventEmitter<void>();
    @Output() onIDDClick = new EventEmitter<void>();
    private destroy$ = new Subject<void>(); // Subject for takeUntil

    public package_consistency: any;
    public current_initialized = false;
    public warn_count: number;
    public error_count: number;

    public error_list: ConsistencyResultItem[];
    public info_popup = false;
    public consistency_loading = false;
    public consistency_checked = false;
    public loading: boolean = false;
    public packageInfos$!: Observable<{ response: PackageSummary; message: string }>;

    public show_errors: boolean = true;
    public show_warnings: boolean = true;
    public show_dbms: boolean = true;
    public show_orm: boolean = true;
    public show_i18n: boolean = true;
    public show_gui: boolean = true;

    public selectedConsistencyResultItem: ConsistencyResultItem | null = null;
    public navigationButtons: InfoSubHeaderButton[] = [];
    public actionButtons: InfoSubHeaderButton[] = [];
    public headerExtraInfo: { label: string, value: string, icon?: string }[] = [];
    public validationStatus: ValidationStatusInfo[] = [];

    public metaData: {
        icon: string;
        tooltip: string;
        value: string;
        copyable?: boolean;
        double_backslash?:boolean
      }[];


    public get headerStatus(): { icon?: string, tooltip?: string, label: string, value: string }[] {
        const consistencyLabel = this.consistency_loading ? 'Checking...' : (this.consistency_checked ? `${this.error_count} errors, ${this.warn_count} warnings` : 'Not checked');
        const initializedLabel = Array.isArray(this.package_init_list) && this.package_init_list.includes(this.package.name) ? 'Yes' : 'No';
        return [
            { label: 'Consistency', value: consistencyLabel, icon: this.consistency_checked ? 'check_circle' : (this.consistency_loading ? 'hourglass_top' : 'info') },
            ...this.validationStatus,
            { label: 'Initialized', value: initializedLabel, icon: Array.isArray(this.package_init_list) && this.package_init_list.includes(this.package.name) ? 'check_circle' : 'error' }
        ];
    }

    constructor(
            private snackBar: MatSnackBar,
            private workbenchService: WorkbenchService,
            private matDialog: MatDialog,
            private router: RouterMemory,
            private jsonValidationService: JsonValidationService,
            private installationPathService: InstallationPathService
        ) { }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {
        this.resetConsistencyState();
        // TODO: fetch initialized packages and set current_initialized accordingly
        this.loadInitializedPackages().subscribe((initializedPackages) => {
            this.current_initialized = Array.isArray(initializedPackages) && initializedPackages.includes(this.package.name);
            this.package_init_list = initializedPackages; // Store the list for future reference
        });
        this.loadPackage();
        this.buildNavigationButtons();
        this.buildHeaderExtraInfo();
        this.restoreCachedConsistency();
    }

    loadInitializedPackages(): Observable<string[]> {
        return this.workbenchService.getInitializedPackages().pipe(
            takeUntil(this.destroy$),
            catchError((error) => {
                console.error('Error fetching initialized packages:', error);
                this.snackBar.open('Error fetching initialized packages', 'Close', { duration: 3000 });
                return of([]); // Return an empty array on error
            }),
            shareReplay(1)
        );
    }

    loadPackage() {
        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
        this.packageInfos$ = this.workbenchService.readPackage(this.package.name).pipe(
            shareReplay(1),
            takeUntil(this.destroy$)
        );
        this.packageInfos$.subscribe({
            next: (payload) => {
                this.jsonValidationService.validate(
                    payload.response,
                    'urn:equal:json-schema:core:package.manifest',
                    this.package.name
                ).pipe(takeUntil(this.destroy$)).subscribe({
                    next: (result) => {
                        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
                    },
                    error: () => {
                        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to validate package');
                    }
                });
            },
            error: () => {
                this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load package');
            }
        });
        this.metaData =[
            { icon: 'folder', tooltip: 'File Path', value: this.installationPathService.normalizeInstallationPath(this.getPath()).slice(0, -1) || '', copyable:true },
            ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.package) {
            if (changes.package.firstChange) {
                return;
            }

            // Cancel previous in-flight requests before starting new package load.
            this.destroy$.next();
            this.resetConsistencyState();
            this.loadPackage();
            this.buildNavigationButtons();
            this.buildHeaderExtraInfo();
            this.restoreCachedConsistency();
        }
    }

    private restoreCachedConsistency(): void {
        const cached = this.workbenchService.getCachedPackageConsistency(this.package?.name);
        if (!cached || !cached.success) {
            return;
        }

        this.package_consistency = cached.response;
        this.processConsistencyResults(false);
        this.consistency_checked = true;
    }

    private buildNavigationButtons(): void {
        const pkgName = this.package?.name || '';
        this.navigationButtons = [
            { label: 'Models', icon: 'data_object' },
            { label: 'Controllers', icon: 'code' },
            { label: 'Views', icon: 'view_quilt' },
            { label: 'Routes', icon: 'route' },
            { label: 'Applications', icon: 'apps', disabled: true }
        ];
        this.actionButtons = [
            { label: 'Initial data', icon: 'file_present' },
            { label: 'Demo data', icon: 'file_present' }
        ];

    }

    private buildHeaderExtraInfo(): void {
        this.headerExtraInfo = [
            { label: 'Check consistency', value: 'fact_check' },
            { label: 'Init package', value: 'file_present' }
        ];
    }

    public onHeaderExtraClick(item: any): void {
        if (!item || !item.label) return;
        switch (item.label) {
            case 'Check consistency':
                this.checkConsistency();
                break;
            case 'Init package':
                this.initPackage();
                break;
            default:
                break;
        }
    }

    private resetConsistencyState(): void {
        this.consistency_loading = false;
        this.warn_count = 0;
        this.error_count = 0;
        this.error_list = [];
        this.consistency_checked = false;
        this.loadInitializedPackages().subscribe((initializedPackages) => {
            this.current_initialized = Array.isArray(initializedPackages) && initializedPackages.includes(this.package.name);
        });
    }

    public selectConsistencyResultItem(item: ConsistencyResultItem): void {
        this.selectedConsistencyResultItem = item;
    }

    public checkConsistency(): void {
        this.resetConsistencyState();
        this.consistency_loading = true;
        this.workbenchService.checkPackageConsistency(this.package.name).pipe(
            takeUntil(this.destroy$),
            tap((result: any) => {
                if(result.success){
                    this.workbenchService.setCachedPackageConsistency(this.package.name, result);
                    this.package_consistency = result.response;
                    this.processConsistencyResults(true);
                    return result.response;
                }
                else{
                    console.error('Error fetching package consistency:', result.message);
                    this.snackBar.open('Error fetching package consistency', 'Close', { duration: 3000 });
                    return of(null);
                }
            }),
            finalize(() => {
                this.info_popup = true;
                this.consistency_loading = false;
                this.consistency_checked = true;
            }),
        ).subscribe();
    }


    private processConsistencyResults(showToast: boolean = true): void {
        this.warn_count = 0;
        this.error_count = 0;
        this.error_list = [];

        if (!this.package_consistency?.result) return;

        this.package_consistency.result.forEach((message: string) => {
            if (message.startsWith("WARN")) {
                this.error_list.push(<ConsistencyResultItem>{ type: 1, text: message });
                this.warn_count++;
            }
            else if (message.startsWith("ERROR")) {
                this.error_list.push(<ConsistencyResultItem>{ type: 2, text: message });
                this.error_count++;
            }
        });

        if (showToast) {
            this.snackBar.open(`Consistency check complete: ${this.error_count} errors, ${this.warn_count} warnings`, 'Close', { duration: 3000 });
        }
    }

    /*
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
    */

    public onclickModels() {
        this.router.navigate([`/package/${this.package.name}`], {
            queryParams: {
                scope: 'class',
                filter_package: this.package.name
            }
        });
    }

    public onclickControllers() {
        this.router.navigate([`/package/${this.package.name}`], {
            queryParams: {
                scope: 'controller',
                filter_package: this.package.name
            }
        });
    }

    public onclickViews() {
        this.router.navigate([`/package/${this.package.name}`], {
            queryParams: {
                scope: 'view',
                filter_package: this.package.name
            }
        });
    }

    public onclickRoutes() {
        this.router.navigate([`/package/${this.package.name}`], {
            queryParams: {
                scope: 'route',
                filter_package: this.package.name
            }
        });
    }

    public onclickInitData(type: string) {
        this.router.navigate(['/package/' + this.package.name + '/init-data/'+ type]);
    }

    public onSubHeaderNavigation(btn: InfoSubHeaderButton) {
        const label = (btn && btn.label) || '';
        switch (label) {
            case 'Models':
                this.onclickModels();
                break;
            case 'Controllers':
                this.onclickControllers();
                break;
            case 'Views':
                this.onclickViews();
                break;
            case 'Routes':
                this.onclickRoutes();
                break;
            case 'Initial data':
                this.onclickInitData('init');
                break;
            case 'Demo data':
                this.onclickInitData('demo');
                break;
            default:
                break;
        }
    }

    public consitencyPrint():any {
        prettyPrintJson.toHtml(this.package_consistency);
    }

    public get filtered_error_list() {
        return this.error_list.filter((item) => {
            if(!this.show_errors && item.type === 2) return false;
            if(!this.show_warnings && item.type === 1) return false;
            if(!this.show_dbms && item.text.includes('DBM')) return false;
            if(!this.show_orm && item.text.includes('ORM')) return false;
            if(!this.show_i18n && item.text.includes('I18')) return false;
            if(!this.show_gui && item.text.includes('GUI')) return false;
            return true;
        });
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

    private getPath(): string {
        return this.installationPathService.getCurrentInstallationPath() + 'packages/' + this.package.name;
    }
}
