import { NgModule } from '@angular/core';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { UMLORComponent } from './uml-or.component';
import { UMLORRoutingModule } from './uml-or-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { UMLORDisplayerComponent } from './_components/uml-or-displayer/uml-or-displayer.component';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { UMLORNodeComponent } from './_components/uml-or-node/uml-or-node.component';
import { FileSaverComponent } from './_components/file-saver/file-saver.component';
import { PopupLayoutModule } from '../popup-layout/popup-layout.module';
import { FileLoaderComponent } from './_components/file-loader/file-loader.component';
import { DialogConfirmComponent } from './_components/dialog-confirm/dialog-confirm.component';



@NgModule({
  declarations: [
    UMLORComponent,
    UMLORDisplayerComponent,
    UMLORNodeComponent,
    PropertiesEditorComponent,
    FileSaverComponent,
    FileLoaderComponent,
    DialogConfirmComponent
  ],
  imports: [
    SharedLibModule,
    UMLORRoutingModule,
    AutocompleteModule,
    ClassicLayoutModule,
    HeaderModule,
    TypeInputModule,
    PropertyDomainModule,
    PopupLayoutModule
  ]
})
export class UMLORModule { }
