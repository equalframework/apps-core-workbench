import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelTradEditorRoutingModule } from './model-trad-editor-routing.module';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';



@NgModule({
    declarations: [

    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        ModelTradEditorRoutingModule,
    ],
})
export class ModelTradEditorModule { }
