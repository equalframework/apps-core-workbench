import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelActions } from './package-model-actions.component';


const routes: Routes = [
  {
      path: '**',
      component:PackageModelActions
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionsRoutingModule {}
