import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelTradEditorRoutingModule } from './model-trad-editor-routing.module';
import { ModelTradEditorComponent} from './model-trad-editor.component';

import { SharedLibModule } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
  declarations: [
    ModelTradEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedLibModule,
    WorkbenchModule,
    ModelTradEditorRoutingModule,
  ],
})
export class ModelTradEditorModule { }
