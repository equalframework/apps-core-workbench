import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageModelComponent } from './package-model.component';
import { ModelTradEditorModule } from './model-trad-editor/model-trad-editor.module';

const routes: Routes = [
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
