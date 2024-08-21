import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelWorkflowComponent } from './package-model-workflow.component';


const routes: Routes = [
  {
      path: '**',
      component: PackageModelWorkflowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkflowsRoutingModule {}
