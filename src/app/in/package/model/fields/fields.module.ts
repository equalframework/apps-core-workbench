import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldEditorRoutingModule } from './fields-routing.module';
import { ClassicLayoutModule } from '../../../classic-layout/classic-layout.module';
import { FieldEditorListComponent } from './_components/field-editor-list/field-editor-list.component';
import { PackageModelFieldsComponent } from './package-model-fields.component';
import { FieldEditorSpComponent } from './_components/field-editor-sp/field-editor-sp.component';
import { UsagesModule } from 'src/app/in/usages/usages.module';

import { FieldAutocompleteComponent } from './_components/field-autocomplete/field-autocomplete.component';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';


@NgModule({
    declarations: [
        FieldEditorListComponent,
        PackageModelFieldsComponent,
        FieldEditorSpComponent,
        FieldAutocompleteComponent,
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        FieldEditorRoutingModule,
        ClassicLayoutModule,
        UsagesModule,
        PropertyDomainModule
    ],
})
export class PackageModelFieldsModule { }
