import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelTradEditorRoutingModule } from './model-trad-editor-routing.module';
import { ModelTradEditorComponent} from './model-trad-editor.component';

import { SharedLibModule } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslationTableComponent } from './_components/translation-table.component';
import { ScrollIntoViewDirective } from './_components/scroll-into-view.directive';
import { AutoFocusDirective } from './_components/auto-focus.directive';

@NgModule({
  declarations: [
    ModelTradEditorComponent,
    TranslationTableComponent
    ,
    ScrollIntoViewDirective,
    AutoFocusDirective
  ],
  imports: [
    CommonModule,
    SharedLibModule,
    WorkbenchModule,
    ModelTradEditorRoutingModule,
    MatTooltipModule,
  ],
})
export class ModelTradEditorModule { }
