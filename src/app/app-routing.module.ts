import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

    /**
    {
        path: 'views',
        loadChildren: () => import('./in/app.component').then(m => m.AppComponent)
    },
    /* routes specific to current app */
    {
        /*
         default route, for bootstrapping the App
            1) display a loader and try to authentify
            2) store user details (roles and permissions)
            3) redirect to applicable page (/apps or /auth)
         */
        path: '',
        loadChildren: () => import('./in/package/package.module').then(m => m.PackageModule)

    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload', useHash:true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
