import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UmlErdComponent } from './uml-erd.component';


const routes: Routes = [
  {
      path: '**',
      component: UmlErdComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UmlErdRoutingModule {}
