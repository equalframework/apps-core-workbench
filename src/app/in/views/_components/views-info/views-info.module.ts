import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewsInfoComponent } from './views-info.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { SharedLibModule } from 'sb-shared-lib';
import { ItemViewerComponent } from './_components/item-viewer/item-viewer.component';
import { GroupsViewerComponent } from './_components/groups-viewer/groups-viewer.component';



@NgModule({
  declarations: [
    ViewsInfoComponent,
    ItemViewerComponent,
    GroupsViewerComponent,
  ],
  imports: [
    SharedLibModule,
    MatTableModule,
    MatStepperModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [
    ViewsInfoComponent
  ]
})
export class ViewsInfoModule { }
