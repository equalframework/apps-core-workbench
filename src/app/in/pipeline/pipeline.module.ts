import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineComponent } from './pipeline.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PipelineRoutingModule } from './pipeline-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { PipelineDisplayerComponent } from './_components/pipeline-displayer/pipeline-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { PipelineNodeComponent } from './_components/pipeline-node/pipeline-node.component';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { MatGridList, MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';



@NgModule({
  declarations: [
    PipelineComponent,
    PipelineDisplayerComponent,
    PipelineNodeComponent,
    PropertiesEditorComponent
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
    MatSelectModule,
    MatListModule
  ]
})
export class PipelineModule { }
