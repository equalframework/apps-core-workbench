import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineComponent } from './pipeline.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PipelineRoutingModule } from './pipeline-routing.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { PipelineDisplayerComponent } from './_components/pipeline-displayer/pipeline-displayer.component';
import { PipelineNodeComponent } from './_components/pipeline-node/pipeline-node.component';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';

import { MatExpansionModule } from '@angular/material/expansion';
import { ModalInputComponent } from './_components/modal-input/modal-input.component';

import { PipelineLoaderComponent } from './_components/pipeline-loader/pipeline-loader.component';
import { ModalNameDescriptionComponent } from './_components/modal-name-description/modal-name-description.component';
import { ModalExecutionPipelineComponent } from './_components/modal-execution-pipeline/modal-execution-pipeline.component';

@NgModule({
    declarations: [
        PipelineComponent,
        PipelineDisplayerComponent,
        PipelineNodeComponent,
        PropertiesEditorComponent,
        ModalInputComponent,
        PipelineLoaderComponent,
        ModalNameDescriptionComponent,
        ModalExecutionPipelineComponent
    ],
    imports: [
        CommonModule,
        SharedLibModule,
        WorkbenchModule,
        DragDropModule,
        PipelineRoutingModule,
        AutocompleteModule,
        ClassicLayoutModule,
        PropertyDomainModule,
        MatDividerModule,
        MatSelectModule,
        MatExpansionModule,
    ]
})
export class PipelineModule { }
