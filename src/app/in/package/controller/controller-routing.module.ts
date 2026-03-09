import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageControllerComponent } from './package-controller.component';

const routes: Routes = [
    {
        path: 'returns',
        loadChildren: () => import('./return/return.module').then(m => m.PackageControllerReturnModule)
    },
    {
        path: 'params',
        loadChildren: () => import('./params/params.module').then(m => m.PackageControllerParamsModule)

    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControllersRoutingModule {}