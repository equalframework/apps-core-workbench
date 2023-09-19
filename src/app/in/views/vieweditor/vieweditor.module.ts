import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VieweditorComponent } from './vieweditor.component';
import { RouterModule } from '@angular/router';
import { ViewEditorRoutingModule } from './vieweditor-routing.module';



@NgModule({
  declarations: [
    VieweditorComponent
  ],
  imports: [
    CommonModule,
    ViewEditorRoutingModule,
  ]
})
export class VieweditorModule { }
