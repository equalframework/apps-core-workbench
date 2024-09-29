import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageViewComponent } from './package-view.component';


const routes: Routes = [
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
