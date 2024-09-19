import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InitDataComponent } from './init-data.component';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { ParamListComponent } from './_component/param-list/param-list.component';
import { InitSidepaneComponent } from './_component/init-sidepane/init-sidepane.component';
import { InitPopupEditorComponent } from './_component/init-popup-editor/init-popup-editor.component';
import { PopupLayoutModule } from 'src/app/in/popup-layout/popup-layout.module';
import { EntityDialogComponent } from './_component/entity-dialog/entity-dialog.component';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { LangPopupComponent } from './_component/lang-popup/lang-popup.component';

import { ImporterComponent } from './_component/importer/importer.component';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { SharedLibModule } from 'sb-shared-lib';
@NgModule({
  declarations: [
    InitDataComponent,
    ParamListComponent,
    InitSidepaneComponent,
    InitPopupEditorComponent,
    EntityDialogComponent,
    LangPopupComponent,
    ImporterComponent
  ],
  imports: [
    CommonModule,
    SharedLibModule,
    WorkbenchModule,
    ClassicLayoutModule,
    AutocompleteModule
  ],
  exports : [
    InitDataComponent
  ]
})
export class InitDataModule { }
