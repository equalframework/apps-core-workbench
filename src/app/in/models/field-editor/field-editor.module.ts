import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldEditorRoutingModule } from './field-editor-routing.module';
import { HeaderModule } from '../../header/header.module';
import { ClassicLayoutModule } from '../../classic-layout/classic-layout.module';
import { FieldEditorListComponent } from './_components/field-editor-list/field-editor-list.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldEditorComponent } from './field-editor.component';
import { MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { FieldEditorSpComponent } from './_components/field-editor-sp/field-editor-sp.component';
import { MatSelectModule } from '@angular/material/select';
import { UsagesModule } from '../../usages/usages.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { TypeInputModule } from '../../type-input/type-input.module';
import { FieldAutocompleteComponent } from './_components/field-autocomplete/field-autocomplete.component';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppInControllersModule } from '../../controllers/controllers.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { PropertyDomainModule } from '../../property-domain-component/property-domain.module';



@NgModule({
  declarations: [
    FieldEditorListComponent,
    FieldEditorComponent,
    FieldEditorSpComponent,
    FieldAutocompleteComponent,
  ],
  imports: [
    CommonModule,
    FieldEditorRoutingModule,
    HeaderModule,
    ClassicLayoutModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    UsagesModule,
    MatGridListModule,
    TypeInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSlideToggleModule,
    AppInControllersModule,
    MatExpansionModule,
    PropertyDomainModule
  ]
})
export class FieldEditorModule { }
