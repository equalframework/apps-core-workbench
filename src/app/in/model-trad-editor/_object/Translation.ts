import { Menu } from "../../menu-editor/_object/Menu"
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
    view_leftover:any = {}

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

    static MenuConstructor(menu:Menu):Translator {
        let res = new Translator([],[])
        res.view["menu"] = new ViewTranslator(new View({},"list"))
        for(let id of menu.id_compliancy([]).id_list) {
            res.view["menu"].layout[id] = new ViewLayoutItemTranslator()
        }
        return res
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
                if(!this.view[item]){
                    this.view_leftover[item] = values["view"][item]
                    continue
                }
                this.view[item].fill(values["view"][item])
            }
        }
        console.log("error")
        if(values["error"]) {
            this.error.fill(values["error"])
        }
        console.log("finished")
    }

    export() {
        let res:any = {
            "name" : this.name.value,
            "plural" : this.plural.value,
            "description" : this.description.value,
        }
        if(Object.keys(this.model).length > 0) {
            res.model = {}
            for(let key in this.model) {
                if(this.model[key].is_active) {
                    res["model"][key] = {
                        "label" : this.model[key].label.value,
                        "description" : this.model[key].description.value,
                        "help" : this.model[key].help.value
                    }
                }
            }
        }
        if(Object.keys(this.view).length > 0) {
            res.view = {}
            for(let key in this.view) {
                res["view"][key] = {}
                res["view"][key]["name"] = this.view[key].name.value
                res["view"][key]["description"] = this.view[key].description.value
                if(Object.keys(this.view[key].layout).length > 0) {
                    res["view"][key]["layout"] = {}
                    for(let id in this.view[key].layout) {
                        if(!this.view[key].layout[id].is_active) continue
                        res["view"][key]["layout"][id] = {
                            "label" : this.view[key].layout[id].label.value
                        }
                    }
                }
                if(Object.keys(this.view[key].actions).length > 0) {
                    res["view"][key]["actions"] = {}
                    for(let id in this.view[key].actions) {
                        if(!this.view[key].actions[id].is_active) continue
                        res["view"][key]["actions"][id] = {
                            "label" : this.view[key].actions[id].label.value,
                            "description" : this.view[key].actions[id].description.value
                        }
                    }
                }
                if(Object.keys(this.view[key].routes).length > 0) {
                    res["view"][key]["routes"] = {}
                    for(let id in this.view[key].routes) {
                        if(!this.view[key].routes[id].is_active) continue
                        res["view"][key]["routes"][id] = {
                            "label" : this.view[key].routes[id].label.value,
                            "description" : this.view[key].routes[id].description.value
                        }
                    }
                }
            }
            
            for(let key in this.view_leftover){
                res["view"][key] = this.view_leftover[key]
            }
        }
        if(Object.keys(this.error).length > 0) {
            res.error = {}
            for(let key in this.error._base) {
                if(!this.error._base[key].active) continue
                res["error"][key] = {}
                for(let id in this.error._base[key].val) {
                    if(!this.error._base[key].val[id].is_active) continue
                    res["error"][key][id] = this.error._base[key].val[id]._val.value
                }
            }
            if(Object.keys(res.error).length <= 0) {
                delete res.error
            }
        }
        return res
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
            if(!this._base[key]) {
                this._base[key] = {active:false,val:{}}
            } 
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
    name:Translation = new Translation()
    description:Translation = new Translation()
    actions:{[id:string]:ViewActionTranslator} = {}
    routes:{[id:string]:ViewRouteTranslator} = {}

    constructor(view:View) {
        for(let id of view.layout.id_compliant([]).id_list) {
            this.layout[id] = new ViewLayoutItemTranslator()
        }
        for(let action of view.actions) {
            this.actions[action.id] = new ViewActionTranslator()
        }
        for(let route of view.routes) {
            this.routes[route.id] = new ViewRouteTranslator()
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
        if(values["routes"]) {
            for(let item in values["routes"]) {
                if(!this.routes[item]) continue
                this.routes[item].fill(values["routes"][item])
            }
        }
    }
}

export class ViewRouteTranslator {
    label:Translation = new Translation()
    description:Translation = new Translation()

    is_active:boolean = false

    fill(values:any) {
        if(values) 
            this.label = new Translation(values["label"])
            this.description = new Translation(values["description"])
            this.is_active = true
    }
}

export class ViewActionTranslator {
    label:Translation = new Translation()
    description:Translation = new Translation()

    is_active:boolean = false

    fill(values:any) {
        if(values) 
            this.label = new Translation(values["label"])
            this.description = new Translation(values["description"])
            this.is_active = true
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