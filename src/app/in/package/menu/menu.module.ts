import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageMenuComponent } from './package-menu.component';
import { PackageMenuRoutingModule } from './menu-routing.module';
import { ItemEditorComponent } from './_components/item-editor/item-editor.component';

import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
    declarations: [
        PackageMenuComponent,
        ItemEditorComponent,
    ],
    imports: [
        SharedLibModule,
        WorkbenchModule,
        CommonModule,
        PackageMenuRoutingModule,
        AutocompleteModule,
        PropertyDomainModule,
        DragDropModule
    ],
    exports : [
    ]
})
export class PackageMenuModule { }
