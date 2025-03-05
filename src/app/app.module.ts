import { NgModule, LOCALE_ID } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DateAdapter, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform, PlatformModule } from '@angular/cdk/platform';

import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { AppRoutingModule } from './app-routing.module';
import { AppRootComponent } from './app.root.component';
import { AppComponent } from './in/app.component';

import { WorkbenchModule } from 'src/app/_modules/workbench.module';

/* HTTP requests interception dependencies */
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';

// import { PackageModule } from './in/package/package.module';

import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';


/*

import { ModelTradEditorComponent } from 'src/app/in/model-trad-editor/model-trad-editor.component';

import { AutocompleteComponent } from 'src/app/_components/autocomplete/autocomplete.component';
import { PropertyClauseComponent } from 'src/app/_components/property-clause-component/property-clause.component';
import { PropertyDomainComponent } from 'src/app/_components/property-domain-component/property-domain.component';
*/



// specific locale setting
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);


const sharedComponents = [

/*
    AutocompleteComponent,
    PropertyClauseComponent,
    PropertyDomainComponent,
    ModelTradEditorComponent,
        InnerHeaderComponent,
*/

];
@NgModule({
    declarations: [
        AppRootComponent,
        AppComponent
        ],
    imports: [
        SharedLibModule,
        WorkbenchModule,
        AppRoutingModule,
        // PackageModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatNativeDateModule,
        PlatformModule,
        NgxMaterialTimepickerModule.setLocale('fr-BE'),
        TranslateModule.forRoot(),
        HttpClientModule
    ],
    exports: [
        RouterModule
    ],
    providers: [
        // add HTTP interceptor to inject AUTH header to any outgoing request
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000, horizontalPosition: 'start' } },
        { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } },
        { provide: MAT_DATE_LOCALE, useValue: 'fr-BE' },
        { provide: LOCALE_ID, useValue: 'fr-BE' },
        { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    ],
    bootstrap : [AppRootComponent]
    // other module metadata
})
export class AppModule { }
