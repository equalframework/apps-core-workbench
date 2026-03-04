import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageViewComponent } from './package-view.component';
import { ModelTradEditorModule } from '../model/model-trad-editor/model-trad-editor.module';


const routes: Routes = [
  {
    path: 'edit',
    component: PackageViewComponent,
  },
  {
    path: '**',
    component: PackageViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackageViewRoutingModule {}
