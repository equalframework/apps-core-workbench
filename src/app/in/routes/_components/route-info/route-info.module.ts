import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteInfoComponent } from './route-info.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    RouteInfoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  exports: [
    RouteInfoComponent
  ]
})
export class RouteInfoModule { }
