import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VieweditorComponent } from './vieweditor.component';
import { ViewEditorRoutingModule } from './vieweditor-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteOrigin } from '@angular/material/autocomplete';
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
import { PropertyClauseComponent } from '../../property-clause-component/property-clause.component';
import { PropertyClauseModule } from '../../property-clause-component/property-clause.module';
import { PopupParamsComponent } from './_components/action-editor/_components/popup-params/popup-params.component';



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
  ],
  imports: [
    CommonModule,
    ViewEditorRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
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
  ]
})
export class VieweditorModule { }
