import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageViewsComponent } from './package-views.component';

const routes: Routes = [
    {
        path: '**',
        component: PackageViewsComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackageViewsRoutingModule {}
