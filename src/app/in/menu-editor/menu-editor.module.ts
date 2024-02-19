import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MenuEditorComponent } from './menu-editor.component';
import { MenuEditorRoutingModule } from './menu-editor-routing.module';
import { ItemEditorComponent } from './_components/item-editor/item-editor.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../_components/header/header.module';
import { TypeInputModule } from '../_components/type-input/type-input.module';
import { AutocompleteModule } from '../_components/autocomplete/autocomplete.module';
import { PropertyDomainModule } from '../_components/property-domain-component/property-domain.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MultiAutocompleteModule } from './_components/multi-autocomplete/multi-autocomplete.module';
import { VieweditorModule } from '../views/vieweditor/vieweditor.module';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    MenuEditorComponent,
    ItemEditorComponent,

  ],
  imports: [
    CommonModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MenuEditorRoutingModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    TypeInputModule,
    AutocompleteModule,
    PropertyDomainModule,
    MatCheckboxModule,
    MultiAutocompleteModule,
    VieweditorModule,
    MatDividerModule,
    DragDropModule
  ],
  exports : [
  ]
})
export class MenuEditorModule { }
