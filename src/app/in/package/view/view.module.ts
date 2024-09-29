import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageViewComponent } from './package-view.component';
import { PackageViewRoutingModule } from './view-routing.module';

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

import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { PropertyClauseModule } from 'src/app/_components/property-clause-component/property-clause.module';
import { PopupParamsComponent } from './_components/action-editor/_components/popup-params/popup-params.component';
import { HeaderEditorComponent } from './_components/header-editor/header-editor.component';

import { PreDefActionsContainerComponent } from './_components/predef-actions-container/predef-actions-container.component';
import { PreDefActionEditorComponent } from './_components/predef-actions-container/_component/predef-action-editor/predef-action-editor.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';

import { RouterModule } from '@angular/router';
import { SharedLibModule } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

import { RouteEditorComponent } from './_components/route-editor/route-editor.component';
import { RouteEditComponent } from './_components/route-editor/route-edit/route-edit.component';
import { PopupLayoutModule } from 'src/app/in/popup-layout/popup-layout.module';
import { UsagesModule } from 'src/app/in/usages/usages.module';


@NgModule({
  declarations: [
    PackageViewComponent,
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
  ],
  imports: [
    CommonModule,
    WorkbenchModule,
    SharedLibModule,
    PackageViewRoutingModule,
    DragDropModule,
    MatGridListModule,
    HttpClientModule,
    RouterModule,
    PopupLayoutModule,
    UsagesModule
  ],
  exports : [

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
    HttpClientModule,
    MatDialogModule,
    RouterModule
  ]
})
export class PackageViewModule { }
