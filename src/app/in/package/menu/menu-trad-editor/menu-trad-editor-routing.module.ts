import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MenuTradEditorComponent } from './menu-trad-editor.component';

const routes: Routes = [
  {
    path: '**',
    component: MenuTradEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuTradEditorRoutingModule { }
