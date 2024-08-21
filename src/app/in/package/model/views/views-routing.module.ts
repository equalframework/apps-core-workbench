import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageModelViewsComponent } from './package-model-views.component';

const routes: Routes = [
    {
        path: '**',
        component: PackageModelViewsComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewsRoutingModule {}
