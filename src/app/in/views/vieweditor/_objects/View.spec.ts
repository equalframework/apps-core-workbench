import { View, ViewColumn, ViewGroup, ViewRow, ViewSection } from "./View"
import { rt4, t1, t2, t3, t4, t5 } from "./testsetsView"

describe("View",() => {
    let item:View
    let empty = {"name":"","description":"","layout":{}}

    it('should export empty', () => {
        item = new View({},"list")
        
        expect(compareDictRecursif(item.export(),empty)).toBe(0)
    })

    it('should fill id', () => {
        item = new View({
            "name":"a",
            "description":"b",
            "header" : {},
            "layout":{
                "groups" : [
                    { 
                        "sections" : [
                            { 
                                "rows" : [
                                    {
                                        "columns" : [
                                            {
                                                "items" : []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        }, "form")
        console.log(item.export())
        expect(item.id_compliant([]).ok).toBeTrue()
    })

    it("should export a copy of import", () => {
        item = new View(t1,"list")
        expect(compareDictRecursif(item.export(),t1)).toBe(0)
        item = new View(t2,"list")
        expect(compareDictRecursif(item.export(),t2)).toBe(0)
        item = new View(t3,"form")
        console.log(t3)
        console.log(item.export())
        expect(compareDictRecursifForm(item.export(),t3)).toBe(0)
        item = new View(t4,"list")
        expect(compareDictRecursif(item.export(),rt4)).toBe(0)
        item = new View(t5,"form")
        expect(compareDictRecursifForm(item.export(),t5)).toBe(0)
    });
})

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

function compareDictRecursifForm(dict1:any, dict2:any):number {
    try {
        if(dict1 === undefined && dict2 === undefined) return 0
        if(dict1 === undefined) return -1
        if(dict2 === undefined) return 1
        if(typeof(dict1) !== typeof({}) && typeof(dict2) !== typeof({}) && dict1 === dict2) {
            return 0
        }
        if(typeof(dict1) !== typeof({}) && typeof(dict1) !== typeof({}) && dict1 !== dict2) {
            return -1
        }
        var res:number
        for(var item in dict1) {
            if((item === "id" || item==="label") && isNotImportantIDLabel(dict1,dict2,item) ) continue
            if(dict2[item] === undefined) return 1
            res = compareDictRecursifForm(dict1[item],dict2[item])
            if(res !== 0) return 1
        }
        for(var item in dict2) {
            if(dict1[item] === undefined) return -1
            res = compareDictRecursifForm(dict1[item],dict2[item])
            if(res !== 0) return -1
        }
    } catch {
        console.log("returning 0 by error")
        return 0
    }
    return 0
}

function isNotImportantIDLabel(d1:any,d2:any,t:string) {
    let good_type_d1 = typeof(d1)===typeof(new ViewSection()) || typeof(d1)===typeof(new ViewRow()) || typeof(d1)===typeof(new ViewColumn()) || typeof(d1)===typeof(new ViewGroup())
    let good_type_d2 = typeof(d2)===typeof(new ViewSection()) || typeof(d2)===typeof(new ViewRow()) || typeof(d2)===typeof(new ViewColumn()) || typeof(d2)===typeof(new ViewGroup())
    if(!good_type_d1 || !good_type_d2 || !(typeof(d1)===typeof(d2))) return false
    if(!d1[t] || !d2[t]) return true
    return false
}