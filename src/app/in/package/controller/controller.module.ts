import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';

import { PackageControllerComponent } from './package-controller.component';
import { ControllersRoutingModule } from './controller-routing.module';


import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { ParamListComponent } from './params/_components/param-list/param-list.component';
import { ParamSidePaneComponent } from './params/_components/param-side-pane/param-side-pane.component';
import { UsagesModule } from 'src/app/in/usages/usages.module';

import { AutoCompleteComponent } from './params/_components/param-side-pane/_component/property-domain-component_deprecated/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './params/_components/param-side-pane/_component/property-domain-component_deprecated/_components/value/value.component';
import { ValueSelectionComponent } from './params/_components/param-side-pane/_component/property-domain-component_deprecated/_components/value-selection/value-selection.component';

import { PackageControllerReturnComponent } from './return/package-controller-return.component';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';


@NgModule({
    imports: [
        SharedLibModule,
        ControllersRoutingModule,
        WorkbenchModule,
        UsagesModule
    ],
    declarations: [
        PackageControllerComponent,
        PackageControllerParamsComponent,
        PackageControllerReturnComponent,
        ParamListComponent,
        ParamSidePaneComponent,
        AutoCompleteComponent,
        ValueComponent,
        ValueSelectionComponent
    ],
    exports : [
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInControllerModule { }