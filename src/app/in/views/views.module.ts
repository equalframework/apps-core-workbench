import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewsRoutingModule } from './views-routing.module';
import { ViewsInfoComponent } from './_components/views-info/views-info.component';
import { SearchListComponent } from './_components/search-list/search-list.component';
import { SharedLibModule } from 'sb-shared-lib';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ViewsInfoModule } from './_components/views-info/views-info.module';
import { ViewsComponent } from './views.component';
import { MixedCreatorModule } from '../package/_components/mixed-creator/mixed-creator.module';
import { DeleteConfirmationModule } from '../delete-confirmation/delete-confirmation.module';
import { ViewService } from './_services/view.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    SearchListComponent,
    ViewsComponent,
  ],
  imports: [
    SharedLibModule,
    MatTableModule,
    MatStepperModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ViewsRoutingModule,
    MatDialogModule,
    ViewsInfoModule,
    MixedCreatorModule,
    DeleteConfirmationModule,
    HttpClientModule
  ],
  providers : [
    ViewService,
    HttpClientModule
  ]
})
export class ViewsModule { }
