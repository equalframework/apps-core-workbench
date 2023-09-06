import { cloneDeep } from "lodash";

export class FieldClass {
    public name:string;
    public synchronised:boolean;
    public inherited:boolean
    public current_scheme:any
    public sync_scheme:any = undefined

    constructor(name:string,inherited:boolean=false,synchronised:boolean=true,scheme:any=Model) {
        this.name = name;
        this.inherited = inherited;
        this.synchronised = synchronised;
        if(this.synchronised) this.sync_scheme = cloneDeep(scheme);
        this.current_scheme = cloneDeep(scheme);
        console.log(this.current_scheme)
    }

    public checkSync():boolean {
        // TODO : Make this work
        this.synchronised = compareDictRecursif(this.sync_scheme,this.current_scheme) === 0
        console.log(this.synchronised)
        return this.synchronised
    }

    public checkNew():boolean {
        return this.sync_scheme === undefined
    }
}

function compareDictRecursif(dict1:any, dict2:any):number {
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

var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}