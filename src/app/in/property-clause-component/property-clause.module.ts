import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyClauseComponent } from './property-clause.component';
import { AutoCompleteComponent } from './_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/value/value.component';
import { ValueSelectionComponent } from './_components/value-selection/value-selection.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    PropertyClauseComponent,
    AutoCompleteComponent,
    ValueComponent,
    ValueSelectionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
  ],
  exports : [
    PropertyClauseComponent
  ]
})
export class PropertyClauseModule { }
