import { NgModule } from "@angular/core";
import { PipelineComponent } from "./pipeline.component";
import { PipelineRoutingModule } from "./pipeline-routing.module";

@NgModule({
    declarations: [
        PipelineComponent
    ],
    imports: [
        PipelineRoutingModule
    ]
})
export class PipelineModule { }