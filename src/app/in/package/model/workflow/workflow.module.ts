import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageModelWorkflowComponent } from './package-model-workflow.component';
import { SharedLibModule } from 'sb-shared-lib';
import { WorkflowsRoutingModule } from './workflow-routing.module';
import { AutocompleteModule } from 'src/app/_components/autocomplete/autocomplete.module';
import { WorkflowDisplayerComponent } from './_components/workflow-displayer/workflow-displayer.component';
import { WorkflowNodeComponent } from './_components/workflow-node/workflow-node.component';
import { ClassicLayoutModule } from '../../../classic-layout/classic-layout.module';
import { PropertiesEditorComponent } from './_components/properties-editor/properties-editor.component';
import { PropertyDomainModule } from 'src/app/_components/property-domain-component/property-domain.module';
import { WorkbenchModule } from 'src/app/_modules/workbench.module';

@NgModule({
    declarations: [
        PackageModelWorkflowComponent,
        WorkflowDisplayerComponent,
        WorkflowNodeComponent,
        PropertiesEditorComponent
    ],
    imports: [
        SharedLibModule,
        WorkbenchModule,
        CommonModule,
        WorkflowsRoutingModule,
        AutocompleteModule,
        ClassicLayoutModule,
        PropertyDomainModule,
    ]
})
export class PackageModelWorkflowModule { }
