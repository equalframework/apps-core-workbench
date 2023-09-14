import { NgModule } from '@angular/core';

import { MatTableModule} from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SharedLibModule } from 'sb-shared-lib';
import { ModelInfoComponent } from './model-info.component';

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
        ModelInfoComponent
    ],
    exports: [
        ModelInfoComponent
    ]
})
export class ModelsInfoModule { }
