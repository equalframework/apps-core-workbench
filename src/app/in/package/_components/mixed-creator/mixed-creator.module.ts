import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { AsyncPipe, DatePipe } from '@angular/common';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MixedCreatorComponent } from './mixed-creator.component';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
    imports: [
        SharedLibModule,
        MatDialogModule,
        MatButtonModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    declarations: [
        MixedCreatorComponent,
    ],
    exports:[
        MixedCreatorComponent
    ],
    providers: [
        DatePipe,
        AsyncPipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class MixedCreatorModule { }