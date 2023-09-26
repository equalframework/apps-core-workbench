import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VieweditorComponent } from './vieweditor.component';
import { RouterModule } from '@angular/router';
import { ViewEditorRoutingModule } from './vieweditor-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { PropertyDomainComponent } from './_components/property-domain-component/property-domain.component';
import { AutoCompleteComponent } from './_components/property-domain-component/_components/auto-complete/auto-complete.component';
import { ValueComponent } from './_components/property-domain-component/_components/value/value.component';
import { ValueSelectionComponent } from './_components/property-domain-component/_components/value-selection/value-selection.component';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
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



@NgModule({
  declarations: [
    VieweditorComponent,
    PropertyDomainComponent,
    AutoCompleteComponent,
    ValueComponent,
    ValueSelectionComponent,
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
    MatGridListModule
  ]
})
export class VieweditorModule { }
