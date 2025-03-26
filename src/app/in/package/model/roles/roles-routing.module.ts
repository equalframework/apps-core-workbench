import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelRoles } from './package-model-roles.component';


const routes: Routes = [
  {
      path: '**',
      component:PackageModelRoles
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule {}
