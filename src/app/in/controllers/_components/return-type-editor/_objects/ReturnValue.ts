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
    public format:ReturnFormatItem[] = []

    public _has_format = false

    constructor(scheme:any = {}) {
        if(scheme["content-type"]) {
            this.contentType = scheme["content-type"]
            delete scheme["content-type"]
        }
        if(scheme["charset"]) {
            this.contentType = scheme["charset"]
            delete scheme["charset"]
        }
        if(scheme["accept-origin"]) {
            this.contentType = scheme["accept-origin"]
            delete scheme["accept-origin"]
        }
        if(scheme["descriptor"]){
            if(scheme["descriptor"]["type"]) {
                this.type = scheme["descriptor"]["type"]
                delete scheme["descriptor"]["type"]
            }
            if(scheme["descriptor"]["qty"]) {
                this.qty = scheme["descriptor"]["qty"]
                delete scheme["descriptor"]["qty"]
            }
            if(scheme["descriptor"]["usage"]) {
                this.usage = new Usage(scheme["descriptor"]["usage"])
                delete scheme["descriptor"]["usage"]
            }
            if(scheme["descriptor"]["entity"]) {
                this.entity = scheme["descriptor"]["entity"]
                delete scheme["descriptor"]["entity"]
            }
            if(scheme["descriptor"]["format"]) {
                this._has_format = true
                scheme["descriptor"]["format"].foreach((k:string,v:string) => {
                    this.format.push(new ReturnFormatItem(v,k))
                });
                delete scheme["descriptor"]["format"]
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
}