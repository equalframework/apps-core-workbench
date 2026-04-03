import { EventEmitter, Component, Input, OnChanges, OnInit, Output, ViewEncapsulation, SimpleChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';
import { JsonValidationService, ValidationStatusInfo } from 'src/app/in/_services/json-validation.service';

@Component({
    selector: 'info-route',
    templateUrl: './info-route.component.html',
    styleUrls: ['./info-route.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})
export class InfoRouteComponent implements OnInit, OnChanges, OnDestroy {

    @Input() route: EqualComponentDescriptor;
    @Output() redirect = new EventEmitter<string>();

    public loading: boolean = true;

    public methods: string[] = [];

    public liveRoutes: any = {};

    public isLive: boolean = false;
    public validationStatus: ValidationStatusInfo[] = [];

    public routeMeta: { icon: string, tooltip: string, value: string, copyable?: boolean, double_backslash?: boolean }[] = [];

    public backendUrl: string = 'http://equal.local/';

    public operationParams: { [method: string]: string } = {};

    private destroy$ = new Subject<void>();

    public get headerStatus(): { icon?: string, tooltip?: string, label: string, value: string }[] {
        const consistencyLabel = this.isRouteLive() ? 'This route is live.' : 'This route is not active.';
        return [
            { label: 'Consistency', value: consistencyLabel, icon: this.isRouteLive() ? 'check_circle' : 'error' },
            ...this.validationStatus,
        ];
    }

    constructor(
            public dialog: MatDialog,
            public workbenchService: WorkbenchService,
            public provider: EqualComponentsProviderService,
            private jsonValidationService: JsonValidationService
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
        this.methods = [];
        if(changes.route) {
            this.load();
        }
    }

    public load() {
        this.loading = true;

        this.route.name[0] === '/' ? this.route.name = this.route.name : this.route.name = '/' + this.route.name;
        this.provider.getComponent(this.route.package_name, 'route', '', this.route.name)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(
                                            (data) => {
                                                if (data) {
                                                        this.route = data;
                                                        this.isRouteLive();
                                                        this.routeMeta = [{ icon: 'folder', tooltip: 'Declared in', value: this.route.file || '', copyable: true }];
                                                        console.log('Route details loaded:', this.route);
                                                        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, true);
                                                        this.validateSchema();

                                                        for (const method in this.route.item) {
                                                                if (!this.methods.includes(method)) {
                                                                        this.methods.push(method);
                                                                }
                                                        }
                                                } else {
                                                    console.warn('No routes data received:', data);
                                                }
                      },
                      (error) => {
                        console.error('Error loading routes details:', error);
                                                this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', null, false, 'Unable to load route schema');
                      },
                      () => {
                      }
                    );
                    this.loading = false;
    }

        private validateSchema(): void {
                this.jsonValidationService.validate(
                        this.route?.item ?? this.route,
                        'urn:equal:json-schema:core:route',
                        this.route?.package_name
                ).subscribe((result) => {
                        this.validationStatus = this.jsonValidationService.buildStatusInfo('JSON schema', result);
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
        console.log('Redirecting to:', fullUrl);
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
}
