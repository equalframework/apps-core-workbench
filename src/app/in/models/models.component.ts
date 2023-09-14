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

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss'],
  encapsulation: ViewEncapsulation.None
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

    constructor(
        private context: ContextService,
        private api: WorkbenchService,
        private snackBar: MatSnackBar,
        private route:Router,
        private activateRoute:ActivatedRoute
    ) { }

    public async ngOnInit() {
        this.packages = await this.api.getPackages();
        this.eq_class = await this.api.getClasses();
        this.types = await this.api.getTypes();
        const a = this.activateRoute.snapshot.paramMap.get('selected_package')
        this.selected_package =  a ? a : ""
        this.classes_for_selected_package = this.eq_class[this.selected_package];
        this.selected_class = "";
        this.selected_field = undefined;
        this.child_loaded = false;
    }

    /**
     * Select a class.
     *
     * @param eq_class the class that the user has selected
     */
    public async onclickClassSelect(eq_class: string) {
        
        this.schema = await this.api.getSchema(this.selected_package + '\\' + eq_class);
        this.selected_class = eq_class;
        console.log(this.schema)
    }

    public async onChangeStep(step:number) {
        this.step = step;
        if(step == 2) {
            this.route.navigate(['/fields',this.selected_package,this.selected_class])
        }
    }

    /**
     * 
     * 
     * 
     * @returns a list of the editable field of the class
     */
    public async loadUsableField():Promise<FieldClass[]> {
        var a:FieldClass[] = new FieldClassArray
        var nonUsable:string[] = ["id","deleted","state"]
        var fields = this.schema.fields
        var parent_fields
        if (this.schema['parent'] === "equal\\orm\\Model") {
            parent_fields = Model
        } 
        else {
            var parent_scheme = await this.api.getSchema(this.schema['parent'])
            var parent_fields = parent_scheme.fields
        }
        var inherited:boolean
        for(var key in fields) {
            if((nonUsable.includes(key))) continue
            inherited = false
            if(parent_fields[key] !== undefined){
                inherited = true
                for(var info in fields[key]) {
                    if (info === "default") continue; // field can be inherited but have a different default value (for datetime)
                    if (parent_fields[key][info] !== fields[key][info]) {
                        inherited = false
                        break
                    }
                }
            }
            a.push(new FieldClass(key,inherited,true,fields[key]))
        }
        return this.fieldSort(a)
    }

    public async setInherited() {
        var parent_fields
        if (this.schema['parent'] === "equal\\orm\\Model") {
            parent_fields = Model
        } 
        else {
            var parent_scheme = await this.api.getSchema(this.schema['parent'])
            var parent_fields = parent_scheme.fields
        }
        for(let i in this.fields_for_selected_class) {
            let item = this.fields_for_selected_class[i]
            let inherited = false
            if(parent_fields[item.name] !== undefined ) {
                inherited = true
                for(var info in item.current_scheme) {
                    if(info === "default") continue;
                    if(parent_fields[item.name][info] !== item.current_scheme[info]) {
                        inherited = false
                        break
                    }
                }
            }
            this.fields_for_selected_class[i].inherited = inherited
        }
    }

    public fieldSort(input:FieldClass[]):FieldClass[] {
        var a:number
        var res:FieldClass[] = []
        var temp:FieldClass[]
        while(input.length > 0) {
            temp = []
            a = 0
            for(var i:number = 0; i < input.length ; i++) {
                if(input[a].inherited && !input[i].inherited){
                    a = i
                    continue
                }
                else if (!input[a].inherited && input[i].inherited) continue
                if(input[a].name > input[i].name) {
                    a = i
                    continue
                }
            }
            for(var i:number = 0; i < input.length ; i++) {
                if(i === a) {
                    res.push(input[a])
                    continue
                }
                temp.push(input[i])
            }
            input = temp
        }
        console.log(res)
        return res
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
    public oncreateClass(eq_class: string) {
        this.api.createClass(this.selected_package, eq_class);
    }

    /**
     * Select a field.
     *
     * @param field the field that the user has selected
     */
    public onclickFieldSelect(field:FieldClass) {
        this.selected_field = field;
        this.setInherited()
    }

    /**
     * Delete a field for the selected package/class.
     *
     * @param field the name of the field which will be deleted
     */
    public ondeleteField(field: FieldClass) {
        const i = this.fields_for_selected_class.indexOf(field)
        if(i >= 0 ) {
            this.fields_for_selected_class.splice(i,1)
            return
        }
        //this.api.deleteField(this.selected_package, this.selected_class, field);
        /* MAY BE USEFUL WHEN LINK TO BACKEND
        if (this.selected_field == field) {
            this.selected_field = "";
            this.child_loaded = false;
        }
        */
    }

    /**
     * Create a field for the selected package/class.
     *
     * @param new_field name of the new field
     */
    public oncreateField(new_field:any) {
        this.addFieldFront(new_field)
        //this.api.createField(this.selected_package, this.selected_class, new_field)
    }

    public async addFieldFront(name:string) {
        this.fields_for_selected_class.push(new FieldClass(name,false,false))
        this.fields_for_selected_class = this.fieldSort(this.fields_for_selected_class)
    }

    /**
     * Update the schema of the selected class and selected fields.
     *
     * @param new_schema new field schema
     */
    public onUpdateSchema(new_schema: {}) {
        if(this.selected_field?.name != undefined) {
            this.schema.fields[this.selected_field?.name] = new_schema;
            this.api.updateSchema(this.schema, this.selected_package, this.selected_class);
        }
        
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
            this.route.navigate([".."])
        }
        if(this.step === 2 && this.detectAnyChanges()){
            this.snackBar.open("Save or reset changes before quitting.")
            return
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
        console.log(this.schema)
        for(var item in this.fields_for_selected_class) {
            const name:string = this.fields_for_selected_class[item].name
            res["fields"][name] = this.fields_for_selected_class[item].current_scheme
        }
        console.log(res)
        console.log(compareDictRecursif(res,this.schema))
        return res
    }

    public async regenerateSchemaAndPublish() {
        var schema = this.regenerateSchema()
        var timerId = setTimeout(async () => {
            this.api.updateSchema(schema,this.selected_package,this.selected_class)
            this.step --;
            this.snackBar.open("Saved ! Change can take time to be ", '', {
                duration: 1000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
            })
        }, 3000);
        this.snackBar.open("Saving...", 'Cancel', {
            duration: 3000,
            horizontalPosition: 'left',
            verticalPosition: 'bottom'
        }).onAction().subscribe(() => {
            clearTimeout(timerId);
        })
    }

    public detectAnyChanges():boolean {
        for(var i in this.fields_for_selected_class) {
            if(!this.fields_for_selected_class[i].synchronised) return true
        }
        return false
    }

    public async cancelAllChanges() {
        this.selected_field = undefined;
        this.child_loaded = false;
        this.schema = await this.api.getSchema(this.selected_package + '\\' + this.selected_class);
        this.fields_for_selected_class = await this.loadUsableField() 
    }

}

function compareDictRecursif(dict1:any, dict2:any):number {
    if(dict1 === undefined) return -1
    if(dict2 === undefined) return 1
    if(typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 === dict2) {
        return 0
    }
    var res:number
    for(var item in dict1) {
        if(dict2[item] === undefined) return 1
        res = compareDictRecursif(dict1[item],dict2[item])
        if(res !== 0) return 1
    }
    for(var item in dict2) {
        if(dict1[item] === undefined) return 1
        res = compareDictRecursif(dict1[item],dict2[item])
        if(res !== 0) return -1
    }
    return 0
}

// This is the object that should be returned by await this.api.getSchema('equal\orm\model')
var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}