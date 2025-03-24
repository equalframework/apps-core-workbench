import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelPolicies } from './package-model-policies.component';


const routes: Routes = [
  {
      path: '**',
      component: PackageModelPolicies
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoliciesRoutingModule {}
