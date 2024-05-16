import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineComponent } from './pipeline.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PipelineRoutingModule } from './pipeline-routing.module';
import { AutocompleteModule } from '../autocomplete/autocomplete.module';
import { MatTabsModule } from '@angular/material/tabs';
import { PipelineDisplayerComponent } from './_components/pipeline-displayer/pipeline-displayer.component';
import { MatIconModule } from '@angular/material/icon';
import { PipelineNodeComponent } from './_components/pipeline-node/pipeline-node.component';
import { MatButtonModule } from '@angular/material/button';
import { ClassicLayoutModule } from '../classic-layout/classic-layout.module';
import { HeaderModule } from '../header/header.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeInputModule } from '../type-input/type-input.module';
import { PropertyDomainModule } from '../property-domain-component/property-domain.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { ModalInputComponent } from './_components/modal-input/modal-input.component';
import { MatDialogModule } from '@angular/material/dialog';
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
        DragDropModule,
        PipelineRoutingModule,
        AutocompleteModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        ClassicLayoutModule,
        HeaderModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FormsModule,
        TypeInputModule,
        PropertyDomainModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatListModule,
        MatTableModule,
        MatExpansionModule,
        MatDialogModule
    ]
})
export class PipelineModule { }
