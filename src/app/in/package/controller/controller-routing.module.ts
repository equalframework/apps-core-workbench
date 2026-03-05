import { PackageControllersComponent } from './../controllers/package-controllers.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageControllerParamsComponent } from './params/package-controller-params.component';
import { PackageControllerReturnComponent } from './return/package-controller-return.component';

const routes: Routes = [
    {
        path: 'returns',
        component: PackageControllerReturnComponent
    },
    {
        path: '',
        component: PackageControllerParamsComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControllersRoutingModule {}