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
    }

    public checkSync():boolean {
        this.synchronised = this.sync_scheme === this.current_scheme
        return this.synchronised
    }

    public checkNew():boolean {
        return this.sync_scheme === undefined
    }
}

var Model = {"id":{"type":"integer","readonly":true},"creator":{"type":"many2one","foreign_object":"core\\User","default":1},"created":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"modifier":{"type":"many2one","foreign_object":"core\\User","default":1},"modified":{"type":"datetime","default":"2023-09-05T11:49:53+00:00","readonly":true},"deleted":{"type":"boolean","default":false},"state":{"type":"string","selection":["draft","instance","archive"],"default":"instance"},"name":{"type":"alias","alias":"id"}}