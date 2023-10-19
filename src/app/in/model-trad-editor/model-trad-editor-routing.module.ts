import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModelTradEditorComponent } from './model-trad-editor.component';

const routes: Routes = [
  {
      path: '**',
      component: ModelTradEditorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelTradEditorRoutingModule {}
