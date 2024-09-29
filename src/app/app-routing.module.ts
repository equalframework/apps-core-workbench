import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './in/app.component';

const routes: Routes = [
    {
        path: 'package/:package_name',
        loadChildren: () => import('./in/package/package.module').then(m => m.PackageModule)
    },
    {
        path: 'uml',
        loadChildren: () => import('src/app/in/uml-erd/uml-erd.module').then(m => m.UmlErdModule)
    },
    {
        path: 'pipelines',
        loadChildren: () => import('src/app/in/pipeline/pipeline.module').then(m => m.PipelineModule)
    },
    {
        path: 'routes',
        loadChildren: () => import('src/app/in/routes/routes.module').then(m => m.RoutesModule)
    },
    {
        /*
         default route, for bootstrapping the App
            1) display a loader and try to authenticate
            2) store user details (roles and permissions)
            3) redirect to applicable page (/apps or /auth)
         */
        path: '**',
        component: AppComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload', useHash:true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
