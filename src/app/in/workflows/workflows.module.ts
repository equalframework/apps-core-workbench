import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsComponent } from './workflows.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { AutocompleteModule } from '../_components/autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkflowDisplayerComponent } from './_components/workflow-displayer/workflow-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { WorkflowNodeComponent } from './_components/workflow-node/workflow-node.component';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../_components/classic-layout/classic-layout.module';
import { HeaderModule } from '../_components/header/header.module';
import { MatGridList, MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputModule } from '../_components/type-input/type-input.module';
import { PropertyDomainModule } from '../_components/property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';



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
    PropertyDomainModule,
    MatDividerModule
  ]
})
export class WorkflowsModule { }
