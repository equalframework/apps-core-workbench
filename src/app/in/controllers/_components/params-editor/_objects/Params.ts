export class Param {
    public name:string = ""
    public description:string = ""
    public help:string = ""
    public type:string = "string"
    public usage:Usage = new Usage("")
    public required:boolean = false
    public _visibility:boolean = false
    public _visibility_is_domain:boolean = false
    public visible_bool:boolean
    public visible_domain:boolean
    public selection:any[] = []
    public default:any
    public readonly:boolean

    public _has_default:boolean = false
    public _has_selection:boolean = false

    leftover:any = {}

    constructor(name:string,scheme:any = {}) {
        this.name = name
        if(scheme['description']) {
            this.description = scheme["description"]
            delete scheme["description"]
        }
        if(scheme['help']) {
            this.help = scheme["help"]
            delete scheme["help"]
        }
        if(scheme['type']) {
            this.type = scheme["type"]
            delete scheme["type"]
        }
        if(scheme['usage']) {
            this.usage = new Usage(scheme["usage"])
            delete scheme["usage"]
        }
        if(scheme['required']) {
            this.required = scheme["required"]
            delete scheme["required"]
        }
        if(scheme['selection']) {
            this._has_selection = true
            this.selection = scheme["selection"]
            delete scheme["selection"]
        }
        if(scheme['default']) {
            this._has_default = true
            this.default = scheme["default"]
            delete scheme["default"]
        }
        if( scheme['readonly']) {
            this.readonly = scheme["readonly"]
            delete scheme["readonly"]
        }
        if( scheme['visible'] !== undefined) {
            this._visibility = true
            if(typeof scheme['visible'] === "boolean") {
                this.visible_bool = scheme["visible"]
            } else {
                this._visibility_is_domain = true
                this.visible_domain = scheme["visible"]
            }
            delete scheme["visible"]
        }
        this.leftover = scheme
    }
}

export class Usage {
    protected _usage:string|undefined = undefined
    protected _subusage:string|undefined = undefined
    protected _variation:string|undefined = undefined
    protected _length:string[]|undefined = undefined
    protected _min:string|undefined = undefined
    protected _max:string|undefined = undefined

    constructor(value:string=""){
        if(!value) return
        let sliced:string[] = value.split("/")
        let temp:string|undefined = sliced.pop()
        if(temp)
            sliced.push(temp.split(".")[0],temp.split(".").slice(1).join("."))
        temp = sliced.pop()
        if(temp)
            sliced.push(...temp.split(":"))
        temp = sliced.pop()
        if(temp)
            sliced.push(...temp.split("{"))
        temp = sliced.pop()?.replace("}","")
        if(temp)
            sliced.push(...temp.split(","))
        console.log(sliced)

        if(sliced.length > 0) this._usage = sliced.shift()
        if(sliced.length > 0 && value.includes("/")) this._subusage = sliced.shift()
        if(sliced.length > 0 && value.includes(".")) this._variation = sliced.shift()
        if(sliced.length > 0 && value.includes(":")) this._length = sliced.shift()?.split(".")
        if(sliced.length > 0 && value.includes("{") && value.includes(",")) this._min = sliced.shift()
        if(sliced.length > 0 && value.includes("{")) this._max = sliced.shift()
    }

    get usage():string {
        if(this._usage) return this._usage
        return ""
    }

    get subusage():string {
        if(this._subusage) return this._subusage
        return ""
    }

    get variation():string {
        if(this._variation) return this._variation
        return ""
    }

    get length():string {
        if(this._length) return this._length.join(".")
        return ""
    }

    get max():string {
        if(this._max) return this._max
        return ""
    }

    get min():string {
        if(this._min) return this._min
        return ""
    }
    
    public setUsage(value:string) {
        this._usage = value ? value : undefined
        this._subusage = undefined
        this._variation = undefined
        this._length = undefined
        this._min = undefined
        this._max = undefined
    }

    public setSubUsage(value:string) {
        this._subusage = value ? value : undefined
        this._variation = undefined
        this._length = undefined
        this._min = undefined
        this._max = undefined
    }

    public setVariation(value:string) {
        this._variation = value ? value : undefined
        this._length = undefined
        this._min = undefined
        this._max = undefined
        console.log(this)
    }

    public setLength(value:string) {
        // To string is mandatory because compiled js is forcing number type (ts is very useful as you can see)
        this._length = value ? value.toString().split(".") : undefined
    }

    public setMin(value:string) {
        this._min = value ? value : undefined
    }

    public setMax(value:string) {
        this._max = value ? value : undefined
    }
}