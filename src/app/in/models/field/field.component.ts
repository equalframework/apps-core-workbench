import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldClass } from '../_object/FieldClass';
import { WorkbenchService } from '../_service/models.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cloneDeep, isArray } from 'lodash';
import { RouterMemory } from 'src/app/_services/routermemory.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class FieldComponent implements OnInit {

  schema:any = {}
  fields_for_selected_class:FieldClass[] = []
  selected_package:string
  public selected_field:FieldClass|undefined = undefined;
  public child_loaded = false;
  public types: any;
  public selected_class:string;

  constructor(
    private api:WorkbenchService,
    private route:RouterMemory,
    private activatedRoute:ActivatedRoute,
    private snackBar:MatSnackBar

  ) { }

  async ngOnInit() {
    this.types = await this.api.getTypes();

    const a = this.activatedRoute.snapshot.paramMap.get('selected_package')
    this.selected_package =  a ? a : ""
    const b = this.activatedRoute.snapshot.paramMap.get('selected_class')
    this.selected_class =  b ? b : ""
    this.schema = await this.api.getSchema(this.selected_package + '\\' + this.selected_class);
    this.selected_field = undefined;
    this.child_loaded = false;
    this.fields_for_selected_class = await this.loadUsableField() 
    this.setInherited()
  }

  /**
   * @description
   * create all the FieldClass object from the model schema
   * @returns Promise for a prepared field list
   */
  public async loadUsableField():Promise<FieldClass[]> {
    var a:FieldClass[] = []
    var nonUsable:string[] = ["id","deleted","state"]
    var fields = this.schema.fields
    var inherited:boolean
    for(var key in fields) {
        if((nonUsable.includes(key))) continue
        a.push(new FieldClass(key,false,true,fields[key]))
    }
    return this.fieldSort(a)
  }

  /**
   * @description
   * Set the inherited properties for all FieldClass instance in this.field_for_selected_class
   */
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
                if(parent_fields[item.name][info] === item.current_scheme[info]) {
                    continue
                }
                if(equalsCheck(parent_fields[item.name][info] , item.current_scheme[info])){
                    continue
                }
                inherited = false
                break
            }
        }
        this.fields_for_selected_class[i].inherited = inherited
    }
  }

  /**
   * @description sort an array of FieldClass instance by inheritance then by alphabetical order
   * @param input unsorted array
   * @returns sorted array
   */
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
    return res
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
          this.fields_for_selected_class[i].deleted = true
          this.fields_for_selected_class[i].checkSync()
          console.log(this.fields_for_selected_class[i].synchronised)
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

  public getBack() {
    if(!this.detectAnyChanges()){
      this.route.goBack()
    }
  }

  public detectAnyChanges():boolean {
    for(var i in this.fields_for_selected_class) {
        if(!this.fields_for_selected_class[i].synchronised) {
            return true
        } 
    }
    return false
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

  public regenerateSchema():any {
    var res:any = cloneDeep(this.schema)
    res["fields"] = {
        "id":{"type":"integer","readonly":true},
        "deleted":{"type":"boolean","default":false},
        "state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"}
    }
    for(var item in this.fields_for_selected_class) {
        if(this.fields_for_selected_class[item].deleted) continue
        const name:string = this.fields_for_selected_class[item].name
        res["fields"][name] = this.fields_for_selected_class[item].current_scheme
    }
    return res
  }

  public async regenerateSchemaAndPublish() {
      var schema = this.regenerateSchema()
      var timerId = setTimeout(async () => {
          this.api.updateSchema(schema,this.selected_package,this.selected_class)
          this.route.goBack()
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

  public async cancelAllChanges() {
    this.selected_field = undefined;
    this.child_loaded = false;
    this.schema = await this.api.getSchema(this.selected_package + '\\' + this.selected_class);
    this.fields_for_selected_class = await this.loadUsableField() 
  }

}



var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}


function equalsCheck(a:any[], b:any[]) {
    return isArray(a) && isArray(b) && JSON.stringify(a) === JSON.stringify(b);
}