import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassicLayoutComponent } from './classic-layout.component';
import { MatGridListModule } from '@angular/material/grid-list';



@NgModule({
  declarations: [
    ClassicLayoutComponent
  ],
  imports: [
    CommonModule,
    MatGridListModule
  ],
  exports : [
    ClassicLayoutComponent
  ]
})
export class ClassicLayoutModule { }
