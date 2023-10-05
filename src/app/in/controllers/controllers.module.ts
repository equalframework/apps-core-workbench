import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';

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

import { ControllersComponent } from './controllers.component';
import { ControllersRoutingModule } from './controllers-routing.module';
import { SearchListComponent } from './_components/search-list/search-list.component';
import { SearchListControllerComponent } from './_components/search-list-controller/search-list-controller.component';
import { ControllerInfoModule } from './_components/controller-info/controller-info.module';
import { DeleteConfirmationModule } from '../delete-confirmation/delete-confirmation.module';


@NgModule({
    imports: [
        SharedLibModule,
        ControllersRoutingModule,
        MatDialogModule,
        MatButtonModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ControllerInfoModule,
        DeleteConfirmationModule,
    ],
    declarations: [
        ControllersComponent,
        SearchListComponent,
        SearchListControllerComponent,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInControllersModule { }
