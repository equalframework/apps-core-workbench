import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
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
import { ParamsEditorComponent } from './_components/params-editor/params-editor.component';
import { ParamListComponent } from './_components/params-editor/_components/param-list/param-list.component';
import { ParamSidePaneComponent } from './_components/params-editor/_components/param-side-pane/param-side-pane.component';
import { UsagesModule } from '../usages/usages.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainComponent2 } from './_components/params-editor/_components/param-side-pane/_component/property-domain-component/property-domain.component';
import { AutoCompleteComponent } from './_components/params-editor/_components/param-side-pane/_component/property-domain-component/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/params-editor/_components/param-side-pane/_component/property-domain-component/_components/value/value.component';
import { ValueSelectionComponent } from './_components/params-editor/_components/param-side-pane/_component/property-domain-component/_components/value-selection/value-selection.component';
import { MatRadioModule } from '@angular/material/radio';
import { HeaderModule } from '../header/header.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';


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
        ControllerInfoModule,
        DeleteConfirmationModule,
        UsagesModule,
        MatDatepickerModule, 
        MatNativeDateModule,
        TypeInputModule,
        MatRadioModule,
        HeaderModule,
        PropertyDomainModule
    ],
    declarations: [
        ControllersComponent,
        SearchListComponent,
        SearchListControllerComponent,
        ParamsEditorComponent,
        ParamListComponent,
        ParamSidePaneComponent,
        PropertyDomainComponent2,
        AutoCompleteComponent,
        ValueComponent,
        ValueSelectionComponent,

    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class AppInControllersModule { }
