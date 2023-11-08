import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowsComponent } from './workflows.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WorkflowsRoutingModule } from './workflows-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';



@NgModule({
  declarations: [
    WorkflowsComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    WorkflowsRoutingModule,
    AutocompleteModule
  ]
})
export class WorkflowsModule { }
