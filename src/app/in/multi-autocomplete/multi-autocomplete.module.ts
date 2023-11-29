import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiAutocompleteComponent } from './multi-autocomplete.component';



@NgModule({
  declarations: [
    MultiAutocompleteComponent
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  exports : [
    MultiAutocompleteComponent
  ]
})
export class MultiAutocompleteModule { }
