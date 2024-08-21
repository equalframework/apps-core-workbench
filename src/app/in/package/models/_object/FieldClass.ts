import { cloneDeep } from "lodash";

export class FieldClass {
    public name:string;
    public sync_name:string;
    public synchronised:boolean;
    public inherited:boolean
    public current_scheme:any
    public sync_scheme:any = undefined
    public isNew:boolean = false
    public deleted:boolean = false

    // Default value for field
    static get defaultModel(){
        return {"type":"string"}
    }

    constructor(name:string,inherited:boolean=false,synchronised:boolean=true,scheme:any=FieldClass.defaultModel) {
        this.name = name;
        this.sync_name = this.name
        this.inherited = inherited;
        this.synchronised = synchronised;
        this.isNew = !synchronised;
        this.sync_scheme = cloneDeep(scheme);
        this.current_scheme = cloneDeep(scheme);
    }

    public checkSync():boolean {
        // TODO : Make this work
        this.synchronised = compareDictRecursif(this.sync_scheme,this.current_scheme) === 0 && this.sync_name === this.name && !this.deleted
        return this.synchronised
    }
}

/**
 * @description
 * Compare dict1 and dict2 recusrively (could have better optimisation)
 * @param dict1 
 * @param dict2 
 * @returns dict1 === dict2
 */
function compareDictRecursif(dict1:any, dict2:any):number {
    try {
        if(dict1 === undefined) return -1
        if(dict2 === undefined) return 1
        if(typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 === dict2) {
            return 0
        }
        if(typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 !== dict2) {
            return -1
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
    } catch {
        return 0
    }
    return 0
}

