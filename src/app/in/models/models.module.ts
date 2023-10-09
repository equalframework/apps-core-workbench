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

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { ModelsComponent } from './models.component';
import { ModelsRoutingModule } from './models-routing.module';
import { ModelsInfoModule } from './_components/model-info/models-info.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MixedCreatorModule } from '../package/_components/mixed-creator/mixed-creator.module';
import { DeleteConfirmationModule } from '../delete-confirmation/delete-confirmation.module';

@NgModule({
    imports: [
        SharedLibModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ModelsRoutingModule,
        ModelsInfoModule,
        PropertyDomainModule,
        MixedCreatorModule,
        DeleteConfirmationModule,
    ],
    declarations: [
        ModelsComponent,
        SearchListComponent,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInModelsModule { }
