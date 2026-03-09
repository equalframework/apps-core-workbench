import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReturnRoutingModule } from './return-routing.module';
import { ClassicLayoutModule } from '../../../classic-layout/classic-layout.module';
import { PackageControllerReturnComponent } from './package-controller-return.component';
import { UsagesModule } from 'src/app/in/usages/usages.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';


@NgModule({
    declarations: [
        PackageControllerReturnComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ReturnRoutingModule,
        ClassicLayoutModule,
        UsagesModule,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageControllerReturnModule { }
