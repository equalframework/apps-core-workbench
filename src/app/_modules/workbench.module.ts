import { GroupsViewerComponent } from 'src/app/_components/groups-viewer/groups-viewer.component';
import { ItemViewerComponent } from 'src/app/_components/item-viewer/item-viewer.component';
import { NgModule} from '@angular/core';



import { SharedLibModule} from 'sb-shared-lib';


import { PropertyClauseModule } from 'src/app/_components/property-clause-component/property-clause.module';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { AutocompleteMultiComponent } from 'src/app/_components/autocomplete-multi/autocomplete-multi.component';
import { InnerHeaderComponent } from 'src/app/_components/inner-header/inner-header.component';

import { SearchMixedListComponent } from 'src/app/_components/search-list/search-mixed-list/search-mixed-list.component';
import { SearchControllersListComponent } from 'src/app/_components/search-list/search-controllers-list/search-controllers-list.component';
import { SearchModelsListComponent } from 'src/app/_components/search-list/search-models-list/search-models-list.component';
import { SearchFieldsListComponent } from 'src/app/_components/search-list/search-fields-list/search-fields-list.component';
import { SearchViewsListComponent } from '../_components/search-list/search-views-list/search-views-list.component';

import { MixedCreatorDialogComponent } from 'src/app/_dialogs/mixed-creator-dialog/mixed-creator-dialog.component';
import { DeleteConfirmationDialogComponent } from 'src/app/_dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { InitValidatorComponent } from 'src/app/_components/info/info-package/_components/init-validator/init-validator.component';

import { RequestSendingDialogComponent } from '../_dialogs/request-sending-dialog/request-sending-dialog.component';

import { InfoPackageComponent } from '../_components/info/info-package/info-package.component';
import { InfoMenuComponent } from '../_components/info/info-menu/info-menu.component';
import { InfoViewComponent } from '../_components/info/info-view/info-view.component';
import { InfoRouteComponent } from '../_components/info/info-route/info-route.component';
import { InfoModelComponent } from '../_components/info/info-model/info-model.component';
import { InfoControllerComponent } from '../_components/info/info-controller/info-controller.component';

import { EditorAccessComponent } from '../_components/editor-access/editor-access.component';

import { TypeInputComponent } from '../_components/type-input/type-input.component';
import { InfoSystemComponent } from '../_components/info/info-system/info-system.component';
import { ExplorerDialogComponent } from '../_dialogs/explorer-dialog/explorer-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ShortenPathPipe } from '../_pipes/shorten-path.pipe';
import { CopyButtonComponent } from '../_components/buttons/copy-button/copy-button.component';
import { JsonViewerComponent } from '../_components/json-viewer/json-viewer.component';
import { RemoveExtensionPipe } from '../_pipes/remove-extension.pipe';
import { SummaryPackageComponent } from '../_components/summary-package/summary-package.component';
import { CloseButtonComponent } from '../_components/buttons/close-button/close-button.component';
import { HierarchicalOverviewComponent } from '../_components/hierarchical-overview/hierarchical-overview.component';
import { InfoHeaderComponent } from '../_components/info/info-header/info-header.component';
import { DoubleBackslashPipe } from '../_pipes/double-backslash.pipe';
import { InfoPolicyComponent } from '../_components/info/info-policy/info-policy.component';
import { PolicyTransformPipe } from '../_pipes/policy-transform.pip';
import { GenericListComponent } from '../_components/generic-list/generic-list.component';
import { InfoActionsComponent } from '../_components/info/info-actions/info-actions.component';
import { InfoRoleComponent } from '../_components/info/info-role/info-role.component';
import { InfoGenericComponent } from '../_components/info/info-generic/info-generic.component';
import { ChipsAutocompleteComponent } from '../_components/chips-auto-complete/chips-auto-complete.component';
import { CheckboxListComponent } from '../_components/checkbox-list/checkbox-list.component';
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
    CopyButtonComponent,
    JsonViewerComponent,
    SummaryPackageComponent,
    CloseButtonComponent,
    HierarchicalOverviewComponent,
    InfoHeaderComponent,
    InfoPolicyComponent,
    GenericListComponent,
    InfoActionsComponent,
    InfoRoleComponent,
    InfoGenericComponent,
    ChipsAutocompleteComponent,
    CheckboxListComponent,

];

const sharedPipes = [
    ShortenPathPipe,
    RemoveExtensionPipe,
    DoubleBackslashPipe,
    PolicyTransformPipe
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
        ...sharedComponents,
        ...sharedPipes
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