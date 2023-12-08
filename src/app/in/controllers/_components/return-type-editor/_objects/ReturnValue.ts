import { Usage } from "../../params-editor/_objects/Params"

export class ReturnValue {
    static get customTypes() {
        return [
            "entity", "any"
        ]
    }

    public contentType:string = "text/plain"
    public acceptOrigin:any = ["*"]
    public charset:string = "utf-8"

    public type:string = "any"
    public qty:string = "many"
    public usage:Usage = new Usage("")
    public entity:string = ""
    public values:ReturnFormatItem[] = []

    public _has_values = false

    constructor(scheme:any = {}) {
        if(scheme["content-type"]) {
            this.contentType = scheme["content-type"]
            delete scheme["content-type"]
        }
        if(scheme["charset"]) {
            this.charset = scheme["charset"]
            delete scheme["charset"]
        }
        if(scheme["accept-origin"]) {
            this.acceptOrigin = scheme["accept-origin"]
            delete scheme["accept-origin"]
        }
        if(scheme["schema"]){
            if(scheme["schema"]["type"]) {
                this.type = scheme["schema"]["type"]
                delete scheme["schema"]["type"]
            }
            if(scheme["schema"]["qty"]) {
                this.qty = scheme["schema"]["qty"]
                delete scheme["schema"]["qty"]
            }
            if(scheme["schema"]["usage"]) {
                this.usage = new Usage(scheme["schema"]["usage"])
                delete scheme["schema"]["usage"]
            }
            if(scheme["schema"]["entity"]) {
                this.entity = scheme["schema"]["entity"]
                delete scheme["schema"]["entity"]
            }
            if(scheme["schema"]["values"]) {
                this._has_values = true
                scheme["schema"]["value"].foreach((k:string,v:string) => {
                    this.values.push(new ReturnFormatItem(v,k))
                });
                delete scheme["schema"]["format"]
            }
        }
    }

    public export() {
        return {
            "content-type" : this.contentType,
            "accept-origin" : this.acceptOrigin,
            "charset" : this.charset,
            "schema" : {
                "type" : this.type,
                "qty" : this.qty,
                "usage" : ReturnValue.customTypes.includes(this.type) ? undefined : this.usage.export(),
                "values" : this._has_values ? this.values.map(value => value.export()) : undefined
            }
        }
    }
}

export class ReturnFormatItem {
    public name:string = ""
    public description:string = ""
    public type:string = "string"
    public usage:Usage = new Usage("")
    public selection:any[] = []
    
    public _has_selection:boolean = false

    constructor(scheme:any={},name:string="") {
        this.name = name
        if(scheme["description"]) {
            this.description = scheme["description"]
            delete scheme["description"]
        }
        if(scheme["type"]) {
            this.type = scheme["type"]
            delete scheme["type"]
        }
        if(scheme["usage"]) {
            this.usage = scheme["usage"]
            delete scheme["usage"]
        }
        if(scheme["selection"]) {
            this._has_selection = true
            this.selection = scheme["selection"]
            delete scheme["selection"]
        }
    }

    export() {
        return {
            "name" : this.name,
            "description" : this.description,
            "type" : this.type,
            "usage" : this.usage,
            "selection" : this._has_selection ? this.selection : undefined
        }
    }
}