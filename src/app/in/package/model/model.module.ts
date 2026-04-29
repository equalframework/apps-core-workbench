import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { PackageModelComponent } from './package-model.component';
import { ModelsRoutingModule } from './model-routing.module';
import { ClassicLayoutModule } from '../../classic-layout/classic-layout.module';

import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
    imports: [
        SharedLibModule,
        WorkbenchModule,
        ModelsRoutingModule,
        ClassicLayoutModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    declarations: [
        PackageModelComponent,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageModelModule { }
