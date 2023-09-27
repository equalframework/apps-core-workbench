import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldComponent } from './field.component';
import { SearchListFieldComponent } from '../_components/search-list-field/search-list-field.component';
import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FieldRoutingModule } from './field-routing.module';
import { FieldContentComponent } from '../_components/field-content/field-content.component';
import { UsageComponent } from '../_components/field-content/_components/usage/usage.component';
import { AdvanceComponentComponent } from '../_components/field-content/_components/advance-component/advance-component.component';
import { PropertyArrayComponentComponent } from '../_components/field-content/_components/_components/property-array-component/property-array-component.component';
import { PropertyIntegerComponentComponent } from '../_components/field-content/_components/_components/property-integer-component/property-integer-component.component';
import { PropertySelectFieldComponentComponent } from '../_components/field-content/_components/_components/property-select-field-component/property-select-field-component.component';
import { PropertySelectClassComponentComponent } from '../_components/field-content/_components/_components/property-select-class-component/property-select-class-component.component';
import { PropertyStringComponentComponent } from '../_components/field-content/_components/_components/property-string-component/property-string-component.component';
import { PropertyBooleanComponentComponent } from '../_components/field-content/_components/_components/property-boolean-component/property-boolean-component.component';
import { RouterPropertyComponent } from '../_components/field-content/_components/router-property/router-property.component';
import { PropertyDomainModule } from '../../property-domain-component/property-domain.module';



@NgModule({
  declarations: [
    FieldComponent,
    SearchListFieldComponent,
    FieldContentComponent,
    RouterPropertyComponent,
    PropertyBooleanComponentComponent,
    PropertyStringComponentComponent,
    PropertySelectClassComponentComponent,
    PropertySelectFieldComponentComponent,
    PropertyIntegerComponentComponent,
    PropertyArrayComponentComponent,
    AdvanceComponentComponent,
    UsageComponent,
  ],
  imports: [
    CommonModule,
    SharedLibModule,
    MatTableModule,
    MatStepperModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FieldRoutingModule,
    PropertyDomainModule,
  ]
})
export class FieldModule { }
