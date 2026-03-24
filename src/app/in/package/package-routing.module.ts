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
        path: 'model/:class_name/fields',
        loadChildren: () => import('./model/fields/fields.module').then(m => m.PackageModelFieldsModule)
    },
    {
        path: 'model/:class_name/translations',
        loadChildren: () => import('./model/model-trad-editor/model-trad-editor.module').then(m => m.ModelTradEditorModule)
    },
    {
        path: 'model/:class_name/workflow',
        loadChildren: () => import('./model/workflow/workflow.module').then(m => m.PackageModelWorkflowModule)
    },
    {
        path: 'model/:class_name/policies',
        loadChildren: () => import('./model/policies/policies.module').then(m => m.PackageModelPoliciesModule)
    },
    {
        path: 'model/:class_name/actions',
        loadChildren: () => import('./model/actions/actions.module').then(m => m.PackageModelActionsModule)
    },
    {
        path: 'model/:class_name/roles',
        loadChildren: () => import('./model/roles/roles.module').then(m => m.PackageModelRolesModule)
    },
    {
        path: 'model/:class_name',
        component: AppComponent
    },
    {
        path: 'menu/:menu_name/translations',
        loadChildren: () => import('./menu/menu-trad-editor/menu-trad-editor.module').then(m => m.MenuTradEditorModule)
    },
    {
        path: 'menu/:menu_name/edit',
        loadChildren: () => import('./menu/menu.module').then(m => m.PackageMenuModule)
    },
    {
        path: 'menu/:menu_name',
        component: AppComponent
    },
    {
        path: 'controller/:controller_type/:controller_name/edit',
        loadChildren: () => import('./controller/controller.module').then(m => m.AppInControllerModule)
    },
    {
        path: 'controller/:controller_type/:controller_name',
        component: AppComponent
    },
    {
        path: 'route/:route_name',
        component: AppComponent
    },
    {
        path: 'route/**',
        component: AppComponent
    },
    /*
    {
        path: 'routes',
        component: PackageRoutesComponent
    },
    */
    {
        path: 'package/:package_name',
        component: PackageComponent
    },
    {
        path: 'view/:entity_view/edit',
        loadChildren: () => import('./view/view.module').then(m => m.PackageViewModule)
    },
    /*
    {
        path: 'entity/:entity_name/view/:view_name/type/:view_type/translations',
        loadChildren: () => import('./view/view-trad-editor/view-trad-editor.module').then(m => m.ViewTradEditorModule)
    },
    */
    {
        path: 'view/:entity_view',
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
