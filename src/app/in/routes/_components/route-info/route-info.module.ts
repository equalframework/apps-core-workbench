import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteInfoComponent } from './route-info.component';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    RouteInfoComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [
    RouteInfoComponent
  ]
})
export class RouteInfoModule { }
