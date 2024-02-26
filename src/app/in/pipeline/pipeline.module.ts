import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineComponent } from './pipeline.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { PipelineDisplayerComponent } from './_components/pipeline-displayer/pipeline-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';
import { PipelineNodeComponent } from './_components/pipeline-node/pipeline-node.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { PopupLayoutModule } from '../popup-layout/popup-layout.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';
import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';
import { PipelineRoutingModule } from './pipeline-routing.module';



@NgModule({
  declarations: [
    PipelineComponent,
    PipelineDisplayerComponent,
    PipelineNodeComponent,
    PropertiesEditorComponent,
    FileSaverComponent,
    FileLoaderComponent,
    DialogConfirmComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    PipelineRoutingModule,
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
export class PipelineModule { }
