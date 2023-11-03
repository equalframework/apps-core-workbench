import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FieldEditorComponent } from './field-editor.component';

const routes: Routes = [
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: '',
        component: FieldEditorComponent
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FieldEditorRoutingModule {}
