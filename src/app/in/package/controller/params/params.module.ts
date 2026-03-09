import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParamsRoutingModule } from './params-routing.module';
import { ClassicLayoutModule } from '../../../classic-layout/classic-layout.module';
import { ParamListComponent } from './_components/param-list/param-list.component';
import { PackageControllerParamsComponent } from './package-controller-params.component';
import { ParamSidePaneComponent } from './_components/param-side-pane/param-side-pane.component';
import { UsagesModule } from 'src/app/in/usages/usages.module';

import { AutoCompleteComponent } from './_components/param-side-pane/_component/property-domain-component_deprecated/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/param-side-pane/_component/property-domain-component_deprecated/_components/value/value.component';
import { ValueSelectionComponent } from './_components/param-side-pane/_component/property-domain-component_deprecated/_components/value-selection/value-selection.component';

import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';


@NgModule({
    declarations: [
        ParamListComponent,
        PackageControllerParamsComponent,
        ParamSidePaneComponent,
        AutoCompleteComponent,
        ValueComponent,
        ValueSelectionComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ParamsRoutingModule,
        ClassicLayoutModule,
        UsagesModule,
        PropertyDomainModule,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageControllerParamsModule { }
