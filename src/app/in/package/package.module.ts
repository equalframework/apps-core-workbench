import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { AsyncPipe, DatePipe } from '@angular/common';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

import { PackageComponent } from './package.component';
import { PackageRoutesComponent } from './routes/package-routes.component';

import { PackageRoutingModule } from './package-routing.module';

import { ScrollingModule } from '@angular/cdk/scrolling';




@NgModule({
    imports: [
        SharedLibModule,
        PackageRoutingModule,
        WorkbenchModule,
        ScrollingModule,
    ],
    declarations: [
        PackageComponent,
        PackageRoutesComponent
    ],
    providers: [
        DatePipe,
        AsyncPipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageModule { }
