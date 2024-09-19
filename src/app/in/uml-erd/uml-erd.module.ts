import { NgModule } from '@angular/core';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';
import { UmlErdComponent } from './uml-erd.component';
import { UmlErdRoutingModule } from './uml-erd-routing.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { UmlErdDisplayerComponent } from './_components/uml-erd-displayer/uml-erd-displayer.component';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { EntitiesEditorComponent } from './_components/entities-editor/entities-editor.component';

import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { UmlErdNodeComponent } from './_components/uml-erd-node/uml-erd-node.component';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { PopupLayoutModule } from 'src/app/in/popup-layout/popup-layout.module';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';
import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';


@NgModule({
  declarations: [
    UmlErdComponent,
    UmlErdDisplayerComponent,
    UmlErdNodeComponent,
    EntitiesEditorComponent,
    FileSaverComponent,
    FileLoaderComponent,
    DialogConfirmComponent
  ],
  imports: [
    SharedLibModule,
    WorkbenchModule,
    UmlErdRoutingModule,
    AutocompleteModule,
    ClassicLayoutModule,
    PropertyDomainModule,
    PopupLayoutModule
  ]
})
export class UmlErdModule { }
