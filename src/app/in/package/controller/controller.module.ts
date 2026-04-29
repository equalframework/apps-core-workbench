import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { PackageControllerComponent } from './package-controller.component';
import { ControllersRoutingModule } from './controller-routing.module';
import { ClassicLayoutModule } from '../../classic-layout/classic-layout.module';

import { WorkbenchModule } from 'src/app/_modules/workbench.module';

// Import components from params and return modules
import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { PackageControllerReturnComponent } from './return/package-controller-return.component';
import { ParamListComponent } from './params/_components/param-list/param-list.component';
import { ParamSidePaneComponent } from './params/_components/param-side-pane/param-side-pane.component';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { UsagesModule } from 'src/app/in/usages/usages.module';

@NgModule({
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ControllersRoutingModule,
        ClassicLayoutModule,
        MatTabsModule,
        PropertyDomainModule,
        UsagesModule
    ],
    declarations: [
        PackageControllerComponent,
        PackageControllerParamsComponent,
        PackageControllerReturnComponent,
        ParamListComponent,
        ParamSidePaneComponent

    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInControllerModule { }
