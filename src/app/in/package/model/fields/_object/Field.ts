import { cloneDeep, isArray, isObject } from "lodash"
import { Usage } from 'src/app/in/_models/Params';

export class Field {
    public static type_directives: any;

    public type: string = "string";
    public usage: Usage = new Usage();

    public name: string  = "";
    public description: string = "";
    public readonly: boolean = false;
    public required: boolean = false;
    public multilang: boolean = false;
    public unique: boolean = false;
    public store: boolean = false;
    public instant: boolean = false;
    public selection: any[] = [];

    public default: any;

    public foreign_object: string = "";
    public foreign_field: string = "";

    public rel_table: string = ""
    public rel_local_key: string = ""
    public rel_foreign_key: string = ""

    public result_type: string = "string";
    public function: string = "";

    public alias:string = "";

    public dependencies:string[] = [];
    public onupdate:string = "";
    public ondelete:string = "";
    public ondetach:string = "";
    public onrevert:string = "";
    public visible:any = [];
    public sort:"asc"|"desc" = "asc";
    public domain:any = [];

    public _has_default: boolean = false;
    public _has_selection: boolean = false;
    public _has_dependencies: boolean = false;
    public _has_visible: boolean = false;
    public _has_domain: boolean = false;

    public _leftover: any = {};

    public static uneditable_name: string[] = [
        "modified","modifier","id","deleted","created","creator","state"
    ]

    constructor(schema: any = {}, name = "") {
        this.name = name;
        for(let key in this) {
            if(key === "usage") {
                if(schema[key]) {
                    this.usage = new Usage(schema[key]);
                    delete schema[key];
                }
                continue;
            }
            if(schema[key]){
                if(key === 'default') this._has_default = true
                if(key === 'selection') this._has_selection = true
                if(key === 'dependencies') this._has_dependencies = true
                if(key === 'visible') this._has_visible = true
                if(key === 'domain') this._has_domain = true
                this[key] = schema[key]
                delete schema[key]
            }
        }
        this._leftover = schema;
    }

    get finalType() {
        if(this.type !== "computed") return this.type;
        return this.result_type;
    }

    get DummySchema() {
        return {type: this.type, result_type: this.result_type};
    }

    get JSON(): any {
        let res = cloneDeep(this._leftover)
        for(let key in this) {
            if(key === "usage" && Field.type_directives[this.finalType].usage) {
                res[key] = this.usage.export();
                continue;
            }
            if(!Field.type_directives[this.type][key]) continue;
            if(key === "name") continue;
            
            if(key === 'default' && !this._has_default) continue;
            if(key === 'selection' && !this._has_selection) continue;
            if(key === 'dependencies' && !this._has_dependencies) continue;
            if(key === 'visible' && !this._has_visible) continue;
            if(key === 'domain' && !this._has_domain) continue;
            if(!this[key]) continue;
            res[key] = cloneDeep(this[key]);
        }
        return res;
    }

    get isUneditable() {
        return Field.uneditable_name.includes(this.name)
    }

    public areSimilar(other:Field): boolean {
        return compareDictRecursif(this.JSON,other.JSON) === 0;
    }
}

/**
 * @description
 * Compare dict1 and dict2 recursively (could have better optimization)
 * @param dict1 if(!Field.type_directives[this.type][key]) continue
 * @param dict2 
 * @returns dict1 === dict2
 */
function compareDictRecursif(dict1:any, dict2:any):number {
    if(dict1 === undefined && dict2 === undefined) return 0;
    if(dict1 === undefined) return -1;
    if(dict2 === undefined) return 1;
    if(!isObject(dict1) && !isArray(dict1) && !isObject(dict2) && !isArray(dict2)) return (dict1 === dict2) ? 0 : 1;
    var res:number;
    for(var item in dict1) {
        if(dict2[item] === undefined) return 1;
        res = compareDictRecursif(dict1[item],dict2[item]);
        if(res !== 0){
            console.log(item);
            return 1;
        }
    }
    for(var item in dict2) {
        if(dict1[item] === undefined) return 1;
        res = compareDictRecursif(dict1[item], dict2[item]);
        if(res !== 0) {
            console.log(item);
            return -1;
        }
    }
    return 0;
}

