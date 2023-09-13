import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { DatePipe } from '@angular/common';

import { MatTableModule} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SearchListComponent } from './_components/search-list/search-list.component';
import { DeleteConfirmationComponent } from './_components/search-list/_components/delete-confirmation/delete-confirmation.component';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { ModelsComponent } from './models.component';
import { ModelsRoutingModule } from './models-routing.module';
import { ModelInfoComponent } from './_components/model-info/model-info.component';

@NgModule({
    imports: [
        SharedLibModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ModelsRoutingModule
    ],
    declarations: [
        ModelsComponent,
        SearchListComponent,
        DeleteConfirmationComponent,
        ModelInfoComponent,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInModelsModule { }
