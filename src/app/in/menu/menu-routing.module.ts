import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuEditorComponent } from './menu-editor/menu-editor.component';

const routes: Routes = [
  // wildcard route (accept root and any sub route that does not match any of the routes above)
  {
      path: 'edit/:package_name/:menu_name',
      component: MenuEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule {}
