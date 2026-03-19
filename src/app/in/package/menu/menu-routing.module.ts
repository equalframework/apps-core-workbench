import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageMenuComponent } from './package-menu.component';
import { MenuTradEditorModule } from './menu-trad-editor/menu-trad-editor.module';

const routes: Routes = [
  {
    path: 'translations',
    loadChildren: () => import('./menu-trad-editor/menu-trad-editor.module').then(m => MenuTradEditorModule)
  },
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
