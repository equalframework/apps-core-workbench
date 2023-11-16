import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupLayoutComponent } from './popup-layout.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    PopupLayoutComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports : [
    PopupLayoutComponent
  ]
})
export class PopupLayoutModule { }
