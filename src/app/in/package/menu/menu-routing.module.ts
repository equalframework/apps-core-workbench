import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageMenuComponent } from './package-menu.component';

const routes: Routes = [
  {
      path: '',
      component: PackageMenuComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageMenuRoutingModule {}
