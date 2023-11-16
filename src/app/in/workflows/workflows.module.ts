import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsComponent } from './workflows.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkflowDisplayerComponent } from './_components/workflow-displayer/workflow-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { WorkflowNodeComponent } from './_components/workflow-node/workflow-node.component';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { MatGridList, MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputComponent } from '../type-input/type-input.component';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';



@NgModule({
  declarations: [
    WorkflowsComponent,
    WorkflowDisplayerComponent,
    WorkflowNodeComponent,
    PropertiesEditorComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    WorkflowsRoutingModule,
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
    PropertyDomainModule
  ]
})
export class WorkflowsModule { }
