import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuTradEditorRoutingModule } from './menu-trad-editor-routing.module';
import { MenuTradEditorComponent } from './menu-trad-editor.component';

import { SharedLibModule } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

import { TranslationTableComponent } from './_components/translation-table.component';
import { AutoFocusDirective } from './_components/auto-focus.directive';

@NgModule({
  declarations: [
    MenuTradEditorComponent,
    TranslationTableComponent,
    AutoFocusDirective
    ],
  imports: [
    CommonModule,
    SharedLibModule,
    WorkbenchModule,
    MenuTradEditorRoutingModule,
  ],
})
export class MenuTradEditorModule { }
