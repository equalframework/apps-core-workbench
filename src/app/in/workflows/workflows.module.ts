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



@NgModule({
  declarations: [
    WorkflowsComponent,
    WorkflowDisplayerComponent,
    WorkflowNodeComponent
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
    HeaderModule
  ]
})
export class WorkflowsModule { }
