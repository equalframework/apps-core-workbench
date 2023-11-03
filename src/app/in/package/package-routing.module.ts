import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageComponent } from './package.component';

const routes: Routes = [
  {
    path: 'models/:selected_package',
    loadChildren: () => import('../models/models.module').then(m => m.AppInModelsModule)
  },
  {
      path: 'controllers',
      loadChildren: () => import('../controllers/controllers.module').then(m => m.AppInControllersModule)
  },
  {
    path : 'fields/:selected_package/:selected_class',
    loadChildren: () => import('../models/field-editor/field-editor.module').then(m => m.FieldEditorModule)
  },
  {
    path : 'views/:type/:entity',
    loadChildren: () => import('../views/views.module').then(m => m.ViewsModule)
  },
  {
    path : 'views_edit/:view_name',
    loadChildren : () => import('../views/vieweditor/vieweditor.module').then(m => m.VieweditorModule)
  },
  {
    path : 'routes/:selected_package',
    loadChildren : () => import('../routes/routes.module').then(m => m.RoutesModule)
  },
  {
    path : 'translation/:type/:selected_package/:selected_model',
    loadChildren : () => import('src/app/in/model-trad-editor/model-trad-editor.module').then(m => m.ModelTradEditorModule)
  },
  // wildcard route (accept root and any sub route that does not match any of the routes above)
  {
      path: '**',
      component: PackageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackageRoutingModule {}
