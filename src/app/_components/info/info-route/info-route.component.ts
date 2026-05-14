import { EventEmitter, Component, Input, OnChanges, OnInit, Output, ViewEncapsulation, SimpleChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';
import { Route } from 'src/app/in/package/routes/Route';
import { ChangeDetectorRef } from '@angular/core';
import { InstallationPathService } from 'src/app/in/_services/installation-path.service';

@Component({
    selector: 'info-route',
    templateUrl: './info-route.component.html',
    styleUrls: ['./info-route.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class InfoRouteComponent implements OnInit, OnChanges, OnDestroy {

    @Input() equalComponentDescriptor: EqualComponentDescriptor;
    @Output() redirect = new EventEmitter<string>();

    public route: Route = new Route({});

    public liveRoutes: { [routeName: string]: { info: { file: string } } } = {};

    public loading: boolean = true;

    public backendUrl: string = 'http://equal.local/';

    public operationParams: { [method: string]: string } = {};

    private destroy$ = new Subject<void>();

    public get headerStatus(): { icon?: string, tooltip?: string, label: string, value: string }[] {
        const consistencyLabel = this.isRouteLive() ? 'This route is live.' : 'This route is not active.';
        return [
            { label: 'Consistency', value: consistencyLabel, icon: this.isRouteLive() ? 'check_circle' : 'error' },
            ...this.route.validationStatus,
        ];
    }

    constructor(
            public dialog: MatDialog,
            public workbenchService: WorkbenchService,
            public provider: EqualComponentsProviderService,
            private jsonValidationService: JsonValidationService,
            private changeDetectorRef: ChangeDetectorRef,
            private installationPathService: InstallationPathService
        ) { }

    public async ngOnInit() {
        // Load backend URL from localStorage, default to 'http://equal.local/'
        const storedUrl = localStorage.getItem('routeBackendUrl');
        if (storedUrl) {
            this.backendUrl = storedUrl;
        }
        const storedParams = localStorage.getItem('routeOperationParams');
        if (storedParams) {
            this.operationParams = JSON.parse(storedParams);
        }
        this.liveRoutes = await this.workbenchService.getRoutesLive().toPromise();
        this.load();
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.route.methods = [];
        if (changes.equalComponentDescriptor) {
            this.load();
        }
    }

    public load() {
        if (!this.equalComponentDescriptor) {
            return;
        }

        this.loading = true;

        const routeName = this.equalComponentDescriptor.name.startsWith('/')
            ? this.equalComponentDescriptor.name
            : '/' + this.equalComponentDescriptor.name;

        this.provider.getComponent(this.equalComponentDescriptor.package_name, 'route', '', routeName)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                                            (data) => {
                                                if (data) {
                                                        this.route = new Route(data);
                                                        this.isRouteLive();

                                                        this.route.routeMeta = [{ icon: 'folder', tooltip: 'Declared in', value: this.installationPathService.normalizeInstallationPath(this.getPath()).slice(0, -1) || '', copyable: true }];
                                                        this.route.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
                                                        this.validateSchema();

                                                        for (const method in this.route.item) {
                                                                if (!this.route.methods.includes(method)) {
                                                                        this.route.methods.push(method);
                                                                }
                                                        }
                                                } else {
                                                    console.warn('No routes data received:', data);
                                                }
                      },
                      (error) => {
                        console.error('Error loading routes details:', error);
                                                this.route.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load route schema');
                      },
                      () => {
                      }
                    );
                    this.loading = false;
                    this.changeDetectorRef.detectChanges();
    }

        private validateSchema(): void {
                this.jsonValidationService.validate(
                        this.route.getSchema(),
                        'urn:equal:json-schema:core:api.route',
                        this.route?.package_name
                ).subscribe((result) => {
                        this.route.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
                });
        }

    //TODO set isLive based on this
    public isRouteLive() {
        let result: boolean = false;
        if(this.route.file && this.liveRoutes.hasOwnProperty(this.route.name) &&
                this.route.file.includes(this.liveRoutes[this.route.name].info.file) ) {
            result = true;
        }

        return result;
    }

    public getRouteMethods() {
        // return Object.keys(this.route_info['methods']);
    }

    public sendTo(method: string, operation: string) {
        let fullUrl = this.backendUrl + operation;
        // Append operation params if provided
        const params = this.operationParams[method];
        if (params && params.trim()) {
            const separator = operation.includes('?') ? '&' : '?';
            fullUrl += separator + params;
        }
        window.open(fullUrl, '_blank');
    }

    public setBackendUrl(url: string): void {
        this.backendUrl = url.endsWith('/') ? url : url + '/';
        localStorage.setItem('routeBackendUrl', this.backendUrl);
    }

    public setOperationParams(method: string, params: string): void {
        this.operationParams[method] = params;
        localStorage.setItem('routeOperationParams', JSON.stringify(this.operationParams));
    }

    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    public getPath(): string {
        let routePath =  this.installationPathService.normalizeInstallationPath(this.installationPathService.getCurrentInstallationPath() + '/packages/' + this.route.file);
        return routePath;
    }
}
