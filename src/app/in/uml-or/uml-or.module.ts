import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UMLORComponent } from './uml-or.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { UMLORRoutingModule } from './uml-or-routing.module';
import { AutocompleteModule } from '../_components/autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { UMLORDisplayerComponent } from './_components/uml-or-displayer/uml-or-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../_components/classic-layout/classic-layout.module';
import { HeaderModule } from '../_components/header/header.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputModule } from '../_components/type-input/type-input.module';
import { PropertyDomainModule } from '../_components/property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';
import { UMLORNodeComponent } from './_components/uml-or-node/uml-or-node.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { PopupLayoutModule } from '../_components/popup-layout/popup-layout.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';
import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';



@NgModule({
  declarations: [
    UMLORComponent,
    UMLORDisplayerComponent,
    UMLORNodeComponent,
    PropertiesEditorComponent,
    FileSaverComponent,
    FileLoaderComponent,
    DialogConfirmComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    UMLORRoutingModule,
    AutocompleteModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    ClassicLayoutModule,
    HeaderModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    TypeInputModule,
    PropertyDomainModule,
    MatDividerModule,
    MatSlideToggleModule,
    PopupLayoutModule,
    MatAutocompleteModule
  ]
})
export class UMLORModule { }
