import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VieweditorComponent } from './vieweditor.component';
import { ViewEditorRoutingModule } from './vieweditor-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GroupEditorComponent } from './_components/group-editor/group-editor.component';
import { EditSectionComponent } from './_components/group-editor/_components/edit-section/edit-section.component';
import { EditRowComponent } from './_components/group-editor/_components/edit-row/edit-row.component';
import { EditColComponent } from './_components/group-editor/_components/edit-col/edit-col.component';
import { EditItemFormComponent } from './_components/group-editor/_components/edit-item-form/edit-item-form.component';
import { TogglingButtonComponent } from './_components/toggling-button/toggling-button.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatGridListModule } from '@angular/material/grid-list';
import { DragTrackerDirective } from './_components/group-editor/dragtracker.directive';
import { DraginfoDirective } from './_components/group-editor/draginfo.directive';
import { HeaderActionsComponent } from './_components/header-actions/header-actions.component';
import { ActionEditorComponent } from './_components/action-editor/action-editor.component';
import { ItemEditorComponent } from './_components/item-editor/item-editor.component';
import { ActionsContainerComponent } from './_components/actions-container/actions-container.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { PropertyDomainModule } from '../../property-domain-component/property-domain.module';
import { PropertyClauseModule } from '../../property-clause-component/property-clause.module';
import { PopupParamsComponent } from './_components/action-editor/_components/popup-params/popup-params.component';
import { HeaderEditorComponent } from './_components/header-editor/header-editor.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PreDefActionsContainerComponent } from './_components/predef-actions-container/predef-actions-container.component';
import { PreDefActionEditorComponent } from './_components/predef-actions-container/_component/predef-action-editor/predef-action-editor.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ViewEditorServicesService } from './_services/view-editor-services.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SharedLibModule } from 'sb-shared-lib';
import { RouteEditorComponent } from './_components/route-editor/route-editor.component';
import { RouteEditComponent } from './_components/route-editor/route-edit/route-edit.component';
import { AccessEditorComponent } from './_components/access-editor/access-editor.component';
import { HeaderModule } from '../../header/header.module';
import { PopupLayoutModule } from '../../popup-layout/popup-layout.module';
import { UsagesModule } from '../../usages/usages.module';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [
    VieweditorComponent,
    GroupEditorComponent,
    EditSectionComponent,
    EditRowComponent,
    EditColComponent,
    EditItemFormComponent,
    TogglingButtonComponent,
    DragTrackerDirective,
    DraginfoDirective,
    HeaderActionsComponent,
    ActionEditorComponent,
    ItemEditorComponent,
    ActionsContainerComponent,
    PopupParamsComponent,
    HeaderEditorComponent,
    PreDefActionsContainerComponent,
    PreDefActionEditorComponent,
    RouteEditorComponent,
    RouteEditComponent,
    AccessEditorComponent,

  ],
  imports: [
    CommonModule,
    ViewEditorRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    DragDropModule,
    MatGridListModule,
    MatRadioModule,
    MatChipsModule,
    PropertyDomainModule,
    PropertyClauseModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    HttpClientModule,
    RouterModule,
    SharedLibModule,
    HeaderModule,
    PopupLayoutModule,
    UsagesModule
  ],
  exports : [
    AccessEditorComponent
  ],
  providers: [
    {
      provide : MatDialogRef,
      useValue: {}
    },
    {
      provide:MAT_DIALOG_DATA,
      useValue:{}
    },
    ViewEditorServicesService,
    HttpClientModule,
    MatDialogModule,
    RouterModule
  ]
})
export class VieweditorModule { }
