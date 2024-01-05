import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UMLORComponent } from './uml-or.component';


const routes: Routes = [
  {
      path: '**',
      component: UMLORComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UMLORRoutingModule {}
