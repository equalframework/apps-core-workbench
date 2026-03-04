import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageComponent } from './package.component';
import { PackageRoutesComponent } from './routes/package-routes.component';
import { AppComponent } from '../app.component';


const routes: Routes = [
    /*
    {
        path: 'fields/:selected_package/:selected_class',
        loadChildren: () => import('../models/field-editor/field-editor.module').then(m => m.FieldEditorModule)
    },
    {
        path: 'views_edit/:view_name',
        loadChildren: () => import('../views/vieweditor/vieweditor.module').then(m => m.VieweditorModule)
    },
    {
        path: 'translation/:type/:selected_package/:selected_model',
        loadChildren: () => import('src/app/in/model-trad-editor/model-trad-editor.module').then(m => m.ModelTradEditorModule)
    },
    {
        path: 'workflow/:package/:model',
        loadChildren: () => import('src/app/in/workflows/workflows.module').then(m => m.WorkflowsModule)
    },
    {
        path: 'view/:view_name',
        loadChildren: () => import('./model/view.module').then(m => m.PackageViewModule)
    },
    */
    {
        path: 'init-data/:type',
        loadChildren: () => import('./init-data/init-data.module').then(m => m.InitDataModule)
    },
    {
        path: 'views',
        component: AppComponent
    },
    {
        path: 'model/:class_name',
        component: AppComponent
    },
    {
        path: 'models',
        component: AppComponent
    },
    {
        path: 'menu/:menu_name',
        component: AppComponent
    },
    {
      path: 'controller/:controller_type/:controller_name',
      component: AppComponent
    },
    {
        path: 'controllers',
        component: AppComponent
    },
    {
        path: 'routes',
        component: PackageRoutesComponent
    },
    {
        path: 'package/:package_name',
        component: PackageComponent
    },
    {
        path: 'entity/:entity_name/view/:view_name/type/:view_type/edit',
        loadChildren: () => import('./view/view.module').then(m => m.PackageViewModule)
    },
    {
        path: 'entity/:entity_name/view/:view_name/type/:view_type',
        component: AppComponent
    },


    
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: '**',
        component: AppComponent
    },



];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageRoutingModule { }
