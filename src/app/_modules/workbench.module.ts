import { GroupsViewerComponent } from 'src/app/_components/groups-viewer/groups-viewer.component';
import { ItemViewerComponent } from 'src/app/_components/item-viewer/item-viewer.component';
import { NgModule, LOCALE_ID } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DateAdapter, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform, PlatformModule } from '@angular/cdk/platform';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';

// import { PackageModule } from './in/package/package.module';

import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';


import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';

/*
import { ControllerInfoComponent } from 'src/app/in/_components/controller-info/controller-info.component';
import { RouteInfoComponent } from 'src/app/in/_components/route-info/route-info.component';
import { MenuInfoComponent } from 'src/app/in/_components/menu-info/menu-info.component';
import { ModelInfoComponent } from 'src/app/in/_components/model-info/model-info.component';
import { ViewsInfoComponent } from 'src/app/in/_components/views-info/views-info.component';
*/

/*
import { TypeInputComponent } from 'src/app/in/type-input/type-input.component';

import { ModelTradEditorComponent } from 'src/app/in/model-trad-editor/model-trad-editor.component';
import { ResponseComponentSubmit } from 'src/app/in/controllers/_components/response/response.component';
import { SearchMixedListComponent } from'src/app/in/_components/search-mixed-list/search-mixed-list.component';

import { AutocompleteComponent } from 'src/app/_components/autocomplete/autocomplete.component';
import { PropertyClauseComponent } from 'src/app/_components/property-clause-component/property-clause.component';
import { PropertyDomainComponent } from 'src/app/_components/property-domain-component/property-domain.component';
*/

import { PropertyClauseModule } from 'src/app/_components/property-clause-component/property-clause.module';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { AutocompleteMultiComponent } from 'src/app/_components/autocomplete-multi/autocomplete-multi.component';
import { InnerHeaderComponent } from 'src/app/_components/inner-header/inner-header.component';

import { SearchMixedListComponent } from 'src/app/_components/search-mixed-list/search-mixed-list.component';
import { SearchControllersListComponent } from 'src/app/_components/search-controllers-list/search-controllers-list.component';
import { SearchModelsListComponent } from 'src/app/_components/search-models-list/search-models-list.component';
import { SearchFieldsListComponent } from 'src/app/_components/search-fields-list/search-fields-list.component';
import { SearchViewsListComponent } from '../_components/search-views-list/search-views-list.component';

import { MixedCreatorDialogComponent } from 'src/app/_dialogs/mixed-creator-dialog/mixed-creator-dialog.component';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { InitValidatorComponent } from 'src/app/_components/info-package/_components/init-validator/init-validator.component';

import { RequestSendingDialogComponent } from '../_dialogs/request-sending-dialog/request-sending-dialog.component';

import { InfoPackageComponent } from '../_components/info-package/info-package.component';
import { InfoMenuComponent } from '../_components/info-menu/info-menu.component';
import { InfoViewComponent } from '../_components/info-view/info-view.component';
import { InfoRouteComponent } from '../_components/info-route/info-route.component';
import { InfoModelComponent } from '../_components/info-model/info-model.component';
import { InfoControllerComponent } from '../_components/info-controller/info-controller.component';

import { EditorAccessComponent } from '../_components/editor-access/editor-access.component';

import { TypeInputComponent } from '../_components/type-input/type-input.component';
import { InfoSystemComponent } from '../_components/info-system/info-system.component';
import { ExplorerDialogComponent } from '../_dialogs/explorer-dialog/explorer-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ShortenPathPipe } from '../_pipes/shorten-path.pipe';
import { CopyButtonComponent } from '../_components/copy-button/copy-button.component';
const sharedComponents = [


/*
    AutocompleteComponent,
    ModelTradEditorComponent,
*/

    InnerHeaderComponent,
    TypeInputComponent,
    SearchMixedListComponent,
    SearchControllersListComponent,
    SearchModelsListComponent,
    SearchFieldsListComponent,
    SearchViewsListComponent,

    AutocompleteMultiComponent,
    MixedCreatorDialogComponent,
    DeleteConfirmationDialogComponent,
    RequestSendingDialogComponent,

    InfoPackageComponent,
        InitValidatorComponent,
    InfoMenuComponent,
    InfoViewComponent,
    InfoRouteComponent,
    InfoModelComponent,
    InfoControllerComponent,
    InfoSystemComponent,
    ItemViewerComponent,
    GroupsViewerComponent,
    EditorAccessComponent,
    ExplorerDialogComponent,
    CopyButtonComponent
];

const sharedPipes = [
    ShortenPathPipe
]
@NgModule({
    declarations: [
        ...sharedComponents,
        ...sharedPipes
    ],
    imports: [
        SharedLibModule,
        PropertyClauseModule,
        PropertyDomainModule,
        AutocompleteModule,
        MatTooltipModule,
        ClipboardModule,
    ],
    exports: [
        PropertyClauseModule,
        PropertyDomainModule,
        AutocompleteModule,
        ...sharedComponents
    ],

    // other module metadata
})
export class WorkbenchModule { }

/*
    Public API Surface of workbench module
    // #memo - this is mandatory for other modules to be able to load Components from this one
*/
export {
    InnerHeaderComponent,
    SearchMixedListComponent,
    SearchControllersListComponent,
    SearchModelsListComponent,
    SearchFieldsListComponent,
    SearchViewsListComponent,
    AutocompleteMultiComponent,
    TypeInputComponent,
    MixedCreatorDialogComponent,
    DeleteConfirmationDialogComponent,
    RequestSendingDialogComponent,
    InfoPackageComponent,
    InfoMenuComponent,
    InfoViewComponent,
    InfoRouteComponent,
    InfoModelComponent,
    InfoControllerComponent,
    InfoSystemComponent,
    EditorAccessComponent,


}