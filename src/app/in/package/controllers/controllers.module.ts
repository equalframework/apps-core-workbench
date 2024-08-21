import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';

import { PackageControllersComponent } from './package-controllers.component';
import { ControllersRoutingModule } from './controllers-routing.module';


import { UsagesModule } from '../../usages/usages.module';

import { WorkbenchModule } from 'src/app/_modules/workbench.module';


@NgModule({
    imports: [
        SharedLibModule,
        ControllersRoutingModule,
        WorkbenchModule,
        UsagesModule
    ],
    declarations: [
        PackageControllersComponent
    ],
    exports : [
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInControllersModule { }