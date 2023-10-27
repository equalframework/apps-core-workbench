import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControllersComponent } from './controllers.component';
import { ParamsEditorComponent } from './_components/params-editor/params-editor.component';

const routes: Routes = [
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
      path: 'params/:type/:controller',
      component : ParamsEditorComponent
    },
    {
        path: ':selected_package',
        component: ControllersComponent
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControllersRoutingModule {}
