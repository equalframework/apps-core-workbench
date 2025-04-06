import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelPoliciesComponent } from './package-model-policies.component';


const routes: Routes = [
  {
      path: '**',
      component: PackageModelPoliciesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoliciesRoutingModule {}
