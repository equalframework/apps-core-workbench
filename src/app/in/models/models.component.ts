import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ContextService } from 'sb-shared-lib';
import { WorkbenchService } from './_service/models.service'
import { FieldContentComponent } from './_components/field-content/field-content.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { prettyPrintJson } from 'pretty-print-json';
import { FieldClassArray } from './_object/FieldClassArray';
import { FieldClass } from './_object/FieldClass';
import { fi } from 'date-fns/locale';
import { cloneDeep, update } from 'lodash';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterMemory } from 'src/app/_services/routermemory.service';
import { MatDialog } from '@angular/material/dialog';
import { MixedCreatorComponent } from '../package/_components/mixed-creator/mixed-creator.component';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss'],
  encapsulation : ViewEncapsulation.Emulated,
})
export class ModelsComponent implements OnInit {

    public child_loaded = false;
    public step = 1;
    public selected_package: string = "";
    public selected_class: string = "";
    public selected_field:FieldClass|undefined = undefined;
    public classes_for_selected_package: string[] = [];
    // http://equal.local/index.php?get=config_packages
    public packages: string[];
    // http://equal.local/index.php?get=core_config_classes
    private eq_class: any;
    public schema: any;
    public fields_for_selected_class: FieldClass[];
    public types: any;
    @ViewChild(FieldContentComponent) childComponent: FieldContentComponent;
    
    public loading = true

    constructor(
        private context: ContextService,
        private api: WorkbenchService,
        private snackBar: MatSnackBar,
        private route:RouterMemory,
        private activateRoute:ActivatedRoute,
        public matDialog:MatDialog
    ) { }

    public async ngOnInit() {
        this.init()
    }

    async init() {
        this.loading = true
        this.packages = await this.api.getPackages();
        this.eq_class = await this.api.getClasses();
        this.types = await this.api.getTypes();
        const a = this.activateRoute.snapshot.paramMap.get('selected_package')
        this.selected_package =  a ? a : ""
        this.classes_for_selected_package = this.eq_class[this.selected_package];
        this.selected_class = ""
        let args = this.route.retrieveArgs()
        if(args && args["class"]) this.onclickClassSelect(args["class"])
        this.selected_field = undefined;
        this.child_loaded = false;
        this.loading = false
    }

    /**
     * Select a class.
     *
     * @param eq_class the class that the user has selected
     */
    public async onclickClassSelect(eq_class: string) {
        
        this.schema = await this.api.getSchema(this.selected_package + '\\' + eq_class);
        this.selected_class = eq_class;
    }

    public async onChangeStep(step:number) {
        this.step = step;
        if(step == 2) {
            this.route.navigate(['/fields',this.selected_package,this.selected_class],{"class":this.selected_class})
        }
        if(step===3) {
            this.route.navigate(['/views',"entity",this.selected_package+'\\'+this.selected_class],{"class":this.selected_class})
        }
    }

    /**
     * Update the name of a class for the selected package.
     *
     * @param event contains the old and new name of the class
     */
    public onupdateClass(event: { old_node: string, new_node: string }) {
        this.api.updateClass(this.selected_package, event.old_node, event.new_node);
    }

    /**
     * Delete a class for the selected package.
     *
     * @param eq_class the name of the class which will be deleted
     */
    public ondeleteClass(eq_class: string) {
        this.api.deleteClass(this.selected_package, eq_class);
    }

    /**
     * Create a class for the selected package.
     *
     * @param eq_class the name of the new class
     */
    public oncreateClass() {
        let d = this.matDialog.open(MixedCreatorComponent,{
            data: { 
                type: "class", 
                package: this.selected_package, 
                lock_type : true,
                lock_package: true, 
            },width : "40em",height: "26em"
        })

        d.afterClosed().subscribe(() => {
            // Do stuff after the dialog has closed
            this.init()
        });
    }


    /**
     *
     * @returns a pretty HTML string of a schema in JSON.
     */
    public getJSONSchema() {
        if(this.schema) {
            return this.prettyPrint(this.schema);
        }
        return null;
    }

    /**
     * Function to pretty-print JSON objects as an HTML string
     *
     * @param input a JSON
     * @returns an HTML string
     */
    private prettyPrint(input: any) {
        return prettyPrintJson.toHtml(input);
    }

    public getBack() {
        if(this.step === 1) {
            this.route.goBack()
        }
        this.step --;
    }

    public regenerateSchema():any {
        var res:any = cloneDeep(this.schema)
        res["fields"] = {
            "id":{"type":"integer","readonly":true},
            "deleted":{"type":"boolean","default":false},
            "state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"}
        }
        for(var item in this.fields_for_selected_class) {
            const name:string = this.fields_for_selected_class[item].name
            res["fields"][name] = this.fields_for_selected_class[item].current_scheme
        }

        return res
    }



}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}