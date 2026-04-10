import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelActionsComponent } from './package-model-actions.component';


const routes: Routes = [
  {
      path: '**',
      component: PackageModelActionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionsRoutingModule {}
