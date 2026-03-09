import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageControllerParamsComponent } from './package-controller-params.component';

const routes: Routes = [
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: '',
        component: PackageControllerParamsComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParamsRoutingModule {}
