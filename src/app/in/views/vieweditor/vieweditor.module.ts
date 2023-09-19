import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VieweditorComponent } from './vieweditor.component';
import { RouterModule } from '@angular/router';
import { ViewEditorRoutingModule } from './vieweditor-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { PropertyDomainComponent } from './_components/property-domain-component/property-domain.component';
import { AutoCompleteComponent } from './_components/property-domain-component/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/property-domain-component/_components/value/value.component';
import { ValueSelectionComponent } from './_components/property-domain-component/_components/value-selection/value-selection.component';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteOrigin } from '@angular/material/autocomplete';
import { GroupEditorComponent } from './_components/group-editor/group-editor.component';



@NgModule({
  declarations: [
    VieweditorComponent,
    PropertyDomainComponent,
    AutoCompleteComponent,
    ValueComponent,
    ValueSelectionComponent,
    GroupEditorComponent,
  ],
  imports: [
    CommonModule,
    ViewEditorRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
  ]
})
export class VieweditorModule { }
