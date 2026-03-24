import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { PackageControllerReturnComponent } from './return/package-controller-return.component';

/**
 * Main container component for controller management
 * Displays params and return modules in side-by-side tabs
 * Manages the shared header above the tabs
 */
@Component({
    selector: 'package-controller',
    templateUrl: './package-controller.component.html',
    styleUrls: ['./package-controller.component.scss'],
    encapsulation : ViewEncapsulation.Emulated,
})
export class PackageControllerComponent implements OnInit, OnDestroy {

    // rx subject for unsubscribing subscriptions on destroy
    private ngUnsubscribe = new Subject<void>();

    public controller_name: string = '';
    public controller_type: string = '';
    public package_name: string = '';
    public loading = true;
    public error = false;
    
    // Tab management
    public selectedTabIndex = 0;

    // ViewChild references to child components for delegating header button actions
    @ViewChild(PackageControllerParamsComponent) paramsComponent: PackageControllerParamsComponent;
    @ViewChild(PackageControllerReturnComponent) returnComponent: PackageControllerReturnComponent;

    constructor(
            private route: ActivatedRoute,
            private location: Location,
            public matDialog: MatDialog,
            private routerMemory: RouterMemory
        ) { }

    public async ngOnInit() {
        this.init();
    }

    public ngOnDestroy() {
        console.debug('PackageControllerComponent::ngOnDestroy');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private async init() {
        this.loading = true;

        this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe( async (params) => {
            this.package_name = params['package_name'];
            this.controller_type = params['controller_type'];
            this.controller_name = params['controller_name'];
            
            if (!this.controller_name || !this.controller_type) {
                this.error = true;
            }
            this.loading = false;
        });
    }

    public getBack() {
        this.location.back();
    }

    public onTabChange(index: number) {
        this.selectedTabIndex = index;
    }

    // Header button delegates - forward to the appropriate child component
    public onHeaderButtonBack() {
        this.getBack();
    }

    public onHeaderButtonCancelOne() {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.cancelOneChange();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.cancelOneChange();
        }
    }

    public onHeaderButtonRevertOne() {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.revertOneChange();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.revertOneChange();
        }
    }

    public onHeaderButtonSave() {
        if (this.selectedTabIndex === 0 && this.paramsComponent) {
            this.paramsComponent.save();
        } else if (this.selectedTabIndex === 1 && this.returnComponent) {
            this.returnComponent.save();
        }
    }

    public onHeaderCustomButton(buttonName: string) {
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
            return this.paramsComponent ? this.paramsComponent.controller_package : '';
        } else {
            return this.returnComponent ? this.returnComponent.package_name : '';
        }
    }

    public get headerControllerName(): string {
        return this.controller_name;
    }
}
