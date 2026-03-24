import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageControllerComponent } from './package-controller.component';

const routes: Routes = [
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