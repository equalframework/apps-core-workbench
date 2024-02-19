import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitDataComponent } from './init-data.component';
import { HeaderModule } from '../_components/header/header.module';
import { ClassicLayoutModule } from '../_components/classic-layout/classic-layout.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ParamListComponent } from './_component/param-list/param-list.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { InitSidepaneComponent } from './_component/init-sidepane/init-sidepane.component';
import { InitPopupEditorComponent } from './_component/init-popup-editor/init-popup-editor.component';
import { PopupLayoutModule } from '../_components/popup-layout/popup-layout.module';
import { TypeInputModule } from '../type-input/type-input.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { EntityDialogComponent } from './_component/entity-dialog/entity-dialog.component';
import { AutocompleteModule } from '../_components/autocomplete/autocomplete.module';
import { MatMenuModule } from '@angular/material/menu';
import { LangPopupComponent } from './_component/lang-popup/lang-popup.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImporterComponent } from './_component/importer/importer.component';



@NgModule({
  declarations: [
    InitDataComponent,
    ParamListComponent,
    InitSidepaneComponent,
    InitPopupEditorComponent,
    EntityDialogComponent,
    LangPopupComponent,
    ImporterComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    ClassicLayoutModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatPaginatorModule,
    MatSortModule,
    PopupLayoutModule,
    TypeInputModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSelectModule, 
    AutocompleteModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  exports : [
    InitDataComponent
  ]
})
export class InitDataModule { }
