import { result } from "lodash";
import { FieldClass } from "./FieldClass";
import { fi } from "date-fns/locale";

export class FieldClassArray extends Array<FieldClass> {
    public getNameList():string[] {
        var result:string[] = [];
        for(var field in this) {
            result.push(this[field].name)
        }
        return result;
    }
    public getInheritDict():{[id:string]:boolean} {
        var result:{[id:string]:boolean} = {}
        for(var field in this) {
            result[this[field].name] = this[field].inherited
        }
        return result
    }
    public getByName(name:string):FieldClass|undefined {
        for(var field in this) {
            if(this[field].name == name) {
                return this[field]
            }
        }
        return undefined
    }
    public removeByName(name:string) {
        for(var  i = 0 ; i < this.length ; i++) {
            if(this[i].name == name) {
                this.splice(i,1)
            }
        }
    }
    public override push(...item:FieldClass[]):number{
        var cpt:number = 0
        for(var i=0; i< item.length ; i++) {
            if(this.getByName(item[i].name) !== undefined) {
                continue
            }
            super.push(item[i])
            cpt ++
        }
        return cpt
    }
}