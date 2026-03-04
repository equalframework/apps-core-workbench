import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModelTradEditorComponent } from '../model/model-trad-editor/model-trad-editor.component';
import { PackageMenuComponent } from './package-menu.component';

const routes: Routes = [
  // wildcard route (accept root and any sub route that does not match any of the routes above)
/*

  {
      path: 'translations',
      component: MenuEditorComponent
      component: ModelTradEditorComponent
  },
*/

  {
      path: 'edit',
      component: PackageMenuComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageMenuRoutingModule {}
