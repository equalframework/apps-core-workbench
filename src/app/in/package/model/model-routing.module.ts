import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageModelComponent } from './package-model.component';

const routes: Routes = [
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: 'fields',
        loadChildren: () => import('./fields/fields.module').then(m => m.PackageModelFieldsModule)
    },
    {
        path: 'views',
        loadChildren: () => import('./views/views.module').then(m => m.PackageModelViewsModule)
    },
    {
        path: 'translations',
        component: PackageModelComponent
    },
    {
        path: 'workflow',
        loadChildren: () => import('./workflow/workflow.module').then(m => m.PackageModelWorkflowModule)
    },
    {
        path: '',
        component: PackageModelComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelsRoutingModule {}
