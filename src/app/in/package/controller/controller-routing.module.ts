import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageControllerComponent } from './package-controller.component';
import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { PackageControllerReturnComponent } from './return/package-controller-return.component';

const routes: Routes = [
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: 'params',
        component: PackageControllerParamsComponent
    },
    {
        path: 'return',
        component: PackageControllerReturnComponent
    },
    /*
    {
        path: 'return',
        component: PackageControllersComponent
    },
    */
    {
        path: '',
        component: PackageControllerComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControllersRoutingModule {}
