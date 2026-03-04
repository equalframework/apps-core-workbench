import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageViewsComponent } from './package-views.component';

const routes: Routes = [
    {
        path: 'entity/:entity_name/view/:view_name/type/:view_type',
        loadChildren: () => import('../model/views/views.module').then(m => m.PackageModelViewsModule)
    },
    {
        path: '**',
        component: PackageViewsComponent,
        
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackageViewsRoutingModule {}
