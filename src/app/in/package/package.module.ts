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
import { PackageInfoComponent } from './_components/package-info/package-info.component';
import { ModelsModule } from '../models/models.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { SearchMixedListComponent } from './_components/search-mixed-list/search-mixed-list.component';
import { ModelsInfoModule } from '../_components/model-info/models-info.module';
import { ControllerInfoModule } from '../controllers/_components/controller-info/controller-info.module';
import { RouteInfoModule } from '../routes/_components/route-info/route-info.module';
import { ViewsInfoModule } from '../views/_components/views-info/views-info.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MixedCreatorModule } from './_components/mixed-creator/mixed-creator.module';
import { DeleteConfirmationModule } from '../delete-confirmation/delete-confirmation.module';
import { InitValidatorComponent } from './_components/package-info/_components/init-validator/init-validator.component';
import { HeaderModule } from '../_components/header/header.module';
import { MatChipsModule } from '@angular/material/chips';
import { ClassicLayoutModule } from '../_components/classic-layout/classic-layout.module';
import { MenuEditorModule } from '../menu-editor/menu-editor.module';
import { InitDataModule } from '../init-data/init-data.module';
import { MenuInfoComponent } from './_components/menu-info/menu-info.component';


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
        ModelsModule,
        MatGridListModule,
        ModelsInfoModule,
        ControllerInfoModule,
        RouteInfoModule,
        ViewsInfoModule,
        ScrollingModule,
        MatProgressSpinnerModule,
        MixedCreatorModule,
        DeleteConfirmationModule,
        HeaderModule,
        MatChipsModule,
        ClassicLayoutModule,
        MenuEditorModule,
        InitDataModule
    ],
    declarations: [
        PackageComponent,
        SearchMixedListComponent,
        PackageInfoComponent,
        InitValidatorComponent,
        MenuInfoComponent
    ],
    providers: [
        DatePipe,
        AsyncPipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class PackageModule { }
