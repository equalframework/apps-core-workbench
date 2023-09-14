import { NgModule } from '@angular/core';

import { MatTableModule} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SharedLibModule } from 'sb-shared-lib';
import { ControllerInfoComponent } from './controller-info.component';
import { RouterPropertyComponent } from '../router-property/router-property.component';
import { DescriptionComponent } from '../router-property/_components/description/description.component';
import { ParamsComponent } from '../router-property/_components/params/params.component';
import { ResponseComponent } from '../router-property/_components/response/response.component';
import { ConstantsComponent } from '../router-property/_components/constants/constants.component';
import { AccessComponent } from '../router-property/_components/access/access.component';
import { ArrayComponent } from '../router-property/_components/params/_components/array/array.component';
import { BooleanComponent } from '../router-property/_components/params/_components/boolean/boolean.component';
import { DomainComponent } from '../router-property/_components/params/_components/domain/domain.component';
import { StringComponent } from '../router-property/_components/params/_components/string/string.component';
import { NumberComponent } from '../router-property/_components/params/_components/number/number.component';
import { AutoCompleteComponent } from '../router-property/_components/params/_components/domain/_components/auto-complete/auto-complete.component';
import { ValueComponent } from '../router-property/_components/params/_components/domain/_components/value/value.component';
import { ValueSelectionComponent } from '../router-property/_components/params/_components/domain/_components/value-selection/value-selection.component';
import { ResponseComponentSubmit } from '../router-property/_components/params/_components/response/response.component';

@NgModule({
    imports: [
        SharedLibModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        
    ],
    declarations: [
        ControllerInfoComponent,
        RouterPropertyComponent,
        DescriptionComponent,
        ParamsComponent,
        ResponseComponent,
        ConstantsComponent,
        AccessComponent,
        ArrayComponent,
        BooleanComponent,
        DomainComponent,
        StringComponent,
        NumberComponent,
        AutoCompleteComponent,
        ValueComponent,
        ValueSelectionComponent,
        ResponseComponentSubmit,
    ],
    exports: [
        ControllerInfoComponent,
        RouterPropertyComponent,
        DescriptionComponent,
        ParamsComponent,
        ResponseComponent,
        ConstantsComponent,
        AccessComponent,
        ArrayComponent,
        BooleanComponent,
        DomainComponent,
        StringComponent,
        NumberComponent,
    ]
})
export class ControllerInfoModule { }
