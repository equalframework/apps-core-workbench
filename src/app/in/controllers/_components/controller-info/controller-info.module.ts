import { NgModule } from '@angular/core';

import { MatTableModule} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ControllerInfoComponent } from './controller-info.component';
import { ResponseComponentSubmit } from '../response/response.component';
import { PropertyDomainModule } from 'src/app/in/property-domain-component/property-domain.module';
import { TypeInputModule } from 'src/app/in/type-input/type-input.module';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatStepperModule,
        MatTabsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        PropertyDomainModule,
        TypeInputModule,
        MatIconModule,
        MatGridListModule,
        MatButtonModule,
        MatExpansionModule
    ],
    declarations: [
        ControllerInfoComponent,
        ResponseComponentSubmit,
    ],
    exports: [
        ControllerInfoComponent,
    ]
})
export class ControllerInfoModule { }
