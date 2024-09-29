import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InitDataComponent } from './init-data.component';

const routes: Routes = [
  // wildcard route (accept root and any sub route that does not match any of the routes above)
/*
  {
      path: 'translations',
      component: MenuEditorComponent
  },
*/
  {
      path: '',
      component: InitDataComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InitDataRoutingModule {}
