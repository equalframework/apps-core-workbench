import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuInfoComponent } from './menu-info/menu-info.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MenuEditorComponent } from './menu-editor/menu-editor.component';
import { MenuRoutingModule } from './menu-routing.module';
import { ItemEditorComponent } from './menu-editor/_components/item-editor/item-editor.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '../header/header.module';
import { TypeInputModule } from '../type-input/type-input.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MultiAutocompleteModule } from '../multi-autocomplete/multi-autocomplete.module';
import { VieweditorModule } from '../views/vieweditor/vieweditor.module';
import { MatDividerModule } from '@angular/material/divider';



@NgModule({
  declarations: [
    MenuInfoComponent,
    MenuEditorComponent,
    ItemEditorComponent,

  ],
  imports: [
    CommonModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MenuRoutingModule,
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
    MatDividerModule
  ],
  exports : [
    MenuInfoComponent
  ]
})
export class MenuModule { }
