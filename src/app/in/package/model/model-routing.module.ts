import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageModelComponent } from './package-model.component';
import { ModelTradEditorModule } from './model-trad-editor/model-trad-editor.module';

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
        loadChildren: () => import('./model-trad-editor/model-trad-editor.module').then(m=>ModelTradEditorModule)
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
