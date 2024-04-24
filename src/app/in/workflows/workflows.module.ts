import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsComponent } from './workflows.component';
import { SharedLibModule } from 'sb-shared-lib';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { WorkflowDisplayerComponent } from './_components/workflow-displayer/workflow-displayer.component';
import { WorkflowNodeComponent } from './_components/workflow-node/workflow-node.component';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [
    WorkflowsComponent,
    WorkflowDisplayerComponent,
    WorkflowNodeComponent,
    PropertiesEditorComponent
  ],
  imports: [
    SharedLibModule,
    CommonModule,
    WorkflowsRoutingModule,
    AutocompleteModule,
    ClassicLayoutModule,
    HeaderModule,
    TypeInputModule,
    PropertyDomainModule,
    MatDividerModule
  ]
})
export class WorkflowsModule { }
