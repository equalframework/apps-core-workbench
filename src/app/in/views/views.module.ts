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
import { ViewsComponent } from './views.component';
import { ViewService } from './_services/models.service';



@NgModule({
  declarations: [
    ViewsInfoComponent,
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
    ViewsRoutingModule
  ]
})
export class ViewsModule { }
