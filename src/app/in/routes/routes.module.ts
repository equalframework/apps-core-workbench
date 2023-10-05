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
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { MatIconModule } from '@angular/material/icon';

import { RoutesComponent } from './routes.component';
import { RoutesRoutingModule } from './routes-routing.module';
import { SearchListComponent } from './_components/search-list/search-list.component';
import { RouteInfoModule } from './_components/route-info/route-info.module';


@NgModule({
    imports: [
        SharedLibModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        RoutesRoutingModule,
        MatExpansionModule,
        MatIconModule,
        RouteInfoModule,
    ],
    declarations: [
        RoutesComponent,
        SearchListComponent,
    ],
    providers: [
        DatePipe,
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
    ]
})
export class RoutesModule { }
