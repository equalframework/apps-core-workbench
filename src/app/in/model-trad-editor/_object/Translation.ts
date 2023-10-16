import { View } from "../../views/vieweditor/_objects/View"

export class Translation {
    public value:string=""

    constructor(value:string|undefined = undefined) {
        if(value !== undefined){
            this.value = value
        }
    }
}

export class Translator {
    name:Translation = new Translation()
    description:Translation = new Translation()
    plural:Translation= new Translation()
    model:{[id:string]:ModelTranslator} = {}
    view:{[id:string]:ViewTranslator} = {}
    error:ErrorTranslator = new ErrorTranslator()
    ok:boolean = true

    constructor(model:string[],view:{name:string,view:View}[]) {
        for(let item of model) {
            this.model[item] = new ModelTranslator()
        }
        for(let item of view) {
            let compl = item.view.id_compliant([])
            if(!compl.ok){
                this.ok = false
                return
            }
            this.view[item.name] = new ViewTranslator(item.view)
        }
        this.error = new ErrorTranslator(model)
    }

    fill(values:any) {
        this.name = new Translation(values["name"])
        this.description = new Translation(values["description"])
        this.plural = new Translation(values["plural"])
        console.log("model")
        if(values["model"]){
            for(let item in values["model"]) {
                if(!this.model[item]) continue
                this.model[item].fill(values["model"][item])
            }
        }
        console.log("view")
        if(values["view"]) {
            for(let item in values["view"]) {
                if(!this.view[item]) continue
                this.view[item].fill(values["view"][item])
            }
        }
        console.log("error")
        if(values["error"]) {
            this.error.fill(values["error"])
        }
        console.log("finished")
    }
} 

export class ErrorTranslator {
    _base:{[id:string]:{active:boolean,val:{[id:string]:ErrorItemTranslator}}} = {"errors":{active:false,val:{}}}

    constructor(model:string[] = []) {
        for(let field of model) {
            this._base[field] = {active:false,val:{}}
        }
    }

    fill(values:any) {
        for(let key in values) {
            this._base[key].active = true
            for(let k2 in values[key]) {
                this._base[key].val[k2] = new ErrorItemTranslator()
                this._base[key].val[k2].fill(values[key][k2])
            }
        }
    }

}

export class ModelTranslator {
    is_active:boolean = false
    label:Translation = new Translation()
    description:Translation = new Translation()
    help:Translation = new Translation()


    fill(values:any) {
        if(values) {
            this.label = new Translation(values["label"])
            this.description = new Translation(values["description"])
            this.help = new Translation(values["help"])
            this.is_active = true
        }
        
    }
}

export class ViewTranslator {
    layout:{[id:string]:ViewLayoutItemTranslator} = {}
    is_active:boolean = false
    name:Translation = new Translation()
    description:Translation = new Translation()
    actions:{[id:string]:ViewLayoutItemTranslator} = {}

    constructor(view:View) {
        for(let id of view.layout.id_compliant([]).id_list) {
            this.layout[id] = new ViewLayoutItemTranslator()
        }
        for(let action of view.actions) {
            this.actions[action.id] = new ViewLayoutItemTranslator()
        }
    }

    fill(values:any) {
        this.name = new Translation(values["name"])
        this.description = new Translation(values["description"])
        if(values["layout"]){
            for(let item in values["layout"]) {
                if(!this.layout[item]) continue
                this.layout[item].fill(values["layout"][item])
            }
        }
        if(values["actions"]){
            for(let item in values["actions"]) {
                if(!this.actions[item]) continue
                this.actions[item].fill(values["actions"][item])
            }
        }
    }
}

export class ViewLayoutItemTranslator {
    label:Translation = new Translation()
    is_active:boolean = false

    fill(values:any) {
        if(values)
            this.label = new Translation(values["label"])
            this.is_active = true
    }
}


export class ErrorItemTranslator {
    _val:Translation = new Translation()
    is_active:boolean = false

    fill(values:any) {
        if(values)
            console.log(values)
            this._val = new Translation(values)
            this.is_active = true
    }
}