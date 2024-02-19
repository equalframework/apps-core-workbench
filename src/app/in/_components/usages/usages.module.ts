import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsagesComponent } from './usages.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    UsagesComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  exports : [
    UsagesComponent
  ]
})
export class UsagesModule { }
