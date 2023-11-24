import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuInfoComponent } from './menu-info/menu-info.component';



@NgModule({
  declarations: [
    MenuInfoComponent
  ],
  imports: [
    CommonModule
  ],
  exports : [
    MenuInfoComponent
  ]
})
export class MenuModule { }
