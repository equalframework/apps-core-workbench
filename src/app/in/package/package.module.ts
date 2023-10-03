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

import { PackageComponent } from './package.component';
import { PackageRoutingModule } from './package-routing.module';
import { SearchListComponent } from './_components/search-list/search-list.component';
import { RouterPropertyComponent } from './_components/router-property/router-property.component';
import { DescriptionComponent } from './_components/router-property/_components/description/description.component';
import { ParamsComponent } from './_components/router-property/_components/params/params.component';
import { ResponseComponent } from './_components/router-property/_components/response/response.component';
import { ConstantsComponent } from './_components/router-property/_components/constants/constants.component';
import { AccessComponent } from './_components/router-property/_components/access/access.component';
import { ArrayComponent } from './_components/router-property/_components/params/_components/array/array.component';
import { BooleanComponent } from './_components/router-property/_components/params/_components/boolean/boolean.component';
import { DomainComponent } from './_components/router-property/_components/params/_components/domain/domain.component';
import { StringComponent } from './_components/router-property/_components/params/_components/string/string.component';
import { NumberComponent } from './_components/router-property/_components/params/_components/number/number.component';
import { AutoCompleteComponent } from './_components/router-property/_components/params/_components/domain/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/router-property/_components/params/_components/domain/_components/value/value.component';
import { ValueSelectionComponent } from './_components/router-property/_components/params/_components/domain/_components/value-selection/value-selection.component';
import { ResponseComponentSubmit } from './_components/router-property/_components/params/_components/response/response.component'
import { PackageInfoComponent } from './_components/package-info/package-info.component';
import { AppInModelsModule } from '../models/models.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { SearchMixedListComponent } from './_components/search-mixed-list/search-mixed-list.component';
import { ModelsInfoModule } from '../models/_components/model-info/models-info.module';
import { ControllerInfoModule } from '../controllers/_components/controller-info/controller-info.module';
import { RouteInfoModule } from '../routes/_components/route-info/route-info.module';
import { ViewsInfoModule } from '../views/_components/views-info/views-info.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MixedCreatorComponent } from './_components/mixed-creator/mixed-creator.component';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MixedCreatorModule } from './_components/mixed-creator/mixed-creator.module';
import { DeleteConfirmationComponent } from './_components/search-mixed-list/_components/delete-confirmation/delete-confirmation.component';


@NgModule({
    imports: [
        SharedLibModule,
        PackageRoutingModule,
        MatDialogModule,
        MatButtonModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        AppInModelsModule,
        MatGridListModule,
        ModelsInfoModule,
        ControllerInfoModule,
        RouteInfoModule,
        ViewsInfoModule,
        ScrollingModule,
        MatProgressSpinnerModule,
        MixedCreatorModule
    ],
    declarations: [
        PackageComponent,
        SearchListComponent,
        SearchMixedListComponent,
        RouterPropertyComponent,
        DescriptionComponent,
        ParamsComponent,
        ResponseComponent,
        ConstantsComponent,
        AccessComponent,
        ArrayComponent,
        BooleanComponent,
        DomainComponent,
        StringComponent,
        NumberComponent,
        AutoCompleteComponent,
        ValueComponent,
        ValueSelectionComponent,
        ResponseComponentSubmit,
        PackageInfoComponent,
        DeleteConfirmationComponent
    ],
    providers: [
        DatePipe,
        AsyncPipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageModule { }
