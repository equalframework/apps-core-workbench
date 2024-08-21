import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PackageComponent } from './package.component';
import { PackageRoutesComponent } from './routes/package-routes.component';


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
        path: 'initdata/:type/:package',
        component: InitDataComponent
    },
    */
    {
        path: 'views',
        loadChildren: () => import('./views/views.module').then(m => m.PackageViewsModule)
    },
    {
        path: 'model/:class_name',
        loadChildren: () => import('./model/model.module').then(m => m.PackageModelModule)
    },
    {
        path: 'models',
        loadChildren: () => import('./models/models.module').then(m => m.PackageModelsModule)
    },
    {
        path: 'menu/:menu_name',
        loadChildren: () => import('./menu/menu.module').then(m => m.PackageMenuModule)
    },
    {
      path: 'controller/:controller_type/:controller_name',
        loadChildren: () => import('./controller/controller.module').then(m => m.AppInControllerModule)
    },
    {
        path: 'controllers',
        loadChildren: () => import('./controllers/controllers.module').then(m => m.AppInControllersModule)
    },
    {
        path: 'routes',
        component: PackageRoutesComponent
    },
    {
        path: ':package_name',
        component: PackageRoutesComponent
    },
    // wildcard route (accept root and any sub route that does not match any of the routes above)
    {
        path: '**',
        component: PackageComponent
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PackageRoutingModule { }
