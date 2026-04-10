import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/router-memory.service';
import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { PackageControllerReturnComponent } from './return/package-controller-return.component';
import { QueryParamNavigatorService } from 'src/app/_services/query-param-navigator.service';
import { QueryParamActivatorRegistry } from 'src/app/_services/query-param-activator.registry';
import { QueryParamTabActivator } from 'src/app/_services/query-param-activator.registry';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

/**
 * Main container component for controller management
 * Displays params and return modules in side-by-side tabs
 * Manages the shared header above the tabs
 */
@Component({
    selector: 'app-package-controller',
    templateUrl: './package-controller.component.html',
    styleUrls: ['./package-controller.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageControllerComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public controllerName = '';
    public controllerType = '';
    public packageName = '';
    public loading = true;
    public error = false;
    public isSaving = false;

    // Tab management
    public selectedTabIndex = 0;

    // Query parameter navigation
    private tabNameToIndexMap: { [key: string]: number } = {
        'parameters': 0,
        'response': 1
    };
    private queryParamActivatorRegistry: QueryParamActivatorRegistry;

    // Shared data for child components
    public types: string[] = [];
    public usages: string[] = [];
    public paramsScheme: any = null;
    public returnScheme: any = null;
    public modelList: string[] = [];
    public entities: string[] = [];
    public componentDescriptor: any = null;
    public dataLoaded = false;

    // ViewChild references to child components for delegating header button actions
    @ViewChild(PackageControllerParamsComponent) paramsComponent: PackageControllerParamsComponent;
    @ViewChild(PackageControllerReturnComponent) returnComponent: PackageControllerReturnComponent;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
            public matDialog: MatDialog,
            private queryParamNavigator: QueryParamNavigatorService,
            private workbenchService: WorkbenchService,
            private provider: EqualComponentsProviderService,
        ) { }

    public async ngOnInit(): Promise<void> {
        this.initializeNavigation();

        this.init();
    }

    private init(): void {
        this.loading = true;
        this.dataLoaded = false;

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.packageName = params['package_name'];
            this.controllerType = params['controller_type'];
            this.controllerName = params['controller_name'];

            if (!this.controllerName || !this.controllerType) {
                this.error = true;
                this.loading = false;
                return;
            }

            // Fetch all data before allowing query param navigation
            await this.fetchControllerData();
            this.dataLoaded = true;
            
            // Subscribe to query parameters for URL-based navigation
            this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
                // Only handle query params after data is loaded
                if (Object.keys(params).length > 0 && this.queryParamActivatorRegistry && this.dataLoaded) {
                    this.queryParamNavigator.handleQueryParams(params, {
                        activators: this.queryParamActivatorRegistry,
                        context: this,
                        elementKeys: ['element'],
                        scrollDelay: 100
                    });
                }
            });
        });

    }

    private async fetchControllerData(): Promise<void> {
        // Phase 1 : Load controller announcement for basic info and params/return scheme
        let originalName = this.packageName + '_' + this.controllerName;
        if (this.componentDescriptor?.file) {
            const parts = this.componentDescriptor.file.split('/');
            originalName = parts[parts.length - 1].replace('.php', '');
        }

        try {
            const scheme = await this.workbenchService.announceController(this.controllerType, originalName).toPromise();
            this.paramsScheme = scheme;
            this.returnScheme = scheme;
            this.loading = false;
            try {
                // Phase 2 : Load additional data
                const [types, usages, modelList, componentDescriptor] = await Promise.all([
                    this.workbenchService.getTypeList(),
                    this.workbenchService.getUsageList(),
                    this.workbenchService.collectClasses(true).toPromise(),
                    this.provider.getComponent(this.packageName, 'controller', '', this.controllerName).toPromise()
                        .catch(err => { console.error('Error fetching component descriptor', err); return null; })
                ]);
                this.types = ['array', ...types];
                this.types.sort((p1, p2) => p1.localeCompare(p2));
                this.usages = usages;
                this.modelList = modelList;
                this.entities = modelList;
                this.componentDescriptor = componentDescriptor;
            } catch (err) {
                console.error('Error fetching controller data', err);
                this.error = true;
                throw err;
            }

        } catch (err) {
            console.error('Failed to fetch controller announcement', err);
            this.loading = false;
            throw err;
        }

    }

    private initializeNavigation(): void {
        this.queryParamActivatorRegistry = new QueryParamActivatorRegistry();
        const tabActivator = new QueryParamTabActivator(this.tabNameToIndexMap, 'selectedTabIndex');
        this.queryParamActivatorRegistry.register(tabActivator);
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public getBack(): void {
        this.location.back();
    }

    public onTabChange(index: number): void {
        this.selectedTabIndex = index;
    }

    // Header button delegates - forward to the appropriate child component
    public onHeaderButtonBack(): void {
        this.getBack();
    }

    public onHeaderButtonCancelOne(): void {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.cancelOneChange();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.cancelOneChange();
        }
    }

    public onHeaderButtonRevertOne(): void {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.revertOneChange();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.revertOneChange();
        }
    }

    public onHeaderButtonSave(): void {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.save();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.save();
        }
    }

    public onHeaderCustomButton(buttonName: string): void {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.handleCustomButton(buttonName);
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.showJson();
        }
    }

    // Helper methods to determine button state
    public get canCancelOne(): boolean {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            return this.paramsComponent.paramListHistory && this.paramsComponent.paramListHistory.length >= 2;
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            return this.returnComponent.lastIndex > 0;
        }
        return false;
    }

    public get canRevertOne(): boolean {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            return this.paramsComponent.paramFutureHistory && this.paramsComponent.paramFutureHistory.length > 0;
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            return this.returnComponent.objectFutureHistory && this.returnComponent.objectFutureHistory.length > 0;
        }
        return false;
    }

    public get headerLabel(): string {
        if (this.selectedTabIndex === 0) {
            return this.paramsComponent ? this.paramsComponent.controllerPackage : '';
        } else {
            return this.returnComponent ? this.returnComponent.controllerPackage : '';
        }
    }

    public get headerControllerName(): string {
        return this.controllerName;
    }
}
