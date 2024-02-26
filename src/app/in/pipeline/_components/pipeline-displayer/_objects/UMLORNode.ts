import { cloneDeep } from "lodash"
import { EmbbedApiService } from "src/app/_services/embbedapi.service"

export class UMLORNode {
    public entity:string = ""
    public fields:any
    public parent:string = "equal\\orm\\Model"
    public hidden:string[]
    public position:{x:number,y:number} = {x : 0 , y : 0}
    public width:number
    public height:number
    public initialPos:{x:number,y:number}
    public showInheritance:boolean = true
    public showRelations:boolean = true

    static api:EmbbedApiService

    constructor(entity:string,x?:number,y?:number,hidden?:string[],parent?:string,showInheritance?:boolean,showRelations?:boolean) {
        this.entity = entity;
        if(x)
            this.position.x = x;
        if(y)
            this.position.y = y;
        this.initialPos = cloneDeep(this.position)
        if(hidden)
            this.hidden = hidden
        if(parent)
            this.parent = parent
        if(showInheritance)
            this.showInheritance = showInheritance
        if(showRelations)
            this.showRelations = showRelations
    }

    get DisplayFields():string[] {
        let ret:string[] = []
        for(let key in this.fields) {
            if(this.hidden.includes(key)) {
                continue
            }
            ret.push(key)
        }
        return ret
    }

    getFieldIndex(name:string):number {
        let count = 0
        for(let key in this.fields) {
            if(key === name) {
                return this.hidden.includes(key) ? -1 : count
            }
            if(this.hidden.includes(key)) {
                continue
            }
            count ++
        }
        return -1
    }


    public static init(api:EmbbedApiService) {
        UMLORNode.api = api
    }

    get fieldNames() {
        return Object.keys(this.fields)
    }

    public static async AsyncConstructor(entity:string,hidden:string[] = [],x:number = 0, y:number = 0, showInheritance?:boolean):Promise<UMLORNode> {
        const schema = await this.api.getSchema(entity)
        let ret = new UMLORNode(entity,x,y,hidden,schema.parent,showInheritance)
        ret.fields = schema.fields ? schema.fields : {}
        return ret
    }

    public export() {
        return {
            "entity" : cloneDeep(this.entity),
            "hidden" : cloneDeep(this.hidden),
            "position" : cloneDeep(this.position),
            "showInheritance" : cloneDeep(this.showInheritance),
            "showRelations" : cloneDeep(this.showRelations)
        }
    }
}