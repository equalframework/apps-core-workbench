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
      path: 'routes',
      loadChildren: () => import('../routes/routes.module').then(m => m.AppInRoutesModule)
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
