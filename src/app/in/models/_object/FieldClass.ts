import { cloneDeep } from "lodash";

export class FieldClass {
    public name:string;
    public synchronised:boolean;
    public inherited:boolean
    public current_scheme:any
    public sync_scheme:any = undefined
    public isNew:boolean = false

    constructor(name:string,inherited:boolean=false,synchronised:boolean=true,scheme:any=Model) {
        this.name = name;
        this.inherited = inherited;
        this.synchronised = synchronised;
        this.isNew = !synchronised;
        this.sync_scheme = cloneDeep(scheme);
        this.current_scheme = cloneDeep(scheme);
    }

    public checkSync():boolean {
        // TODO : Make this work
        this.synchronised = compareDictRecursif(this.sync_scheme,this.current_scheme) === 0
        return this.synchronised
    }
}

// TODO : Optimise this
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

var Model = {"type":"string"}