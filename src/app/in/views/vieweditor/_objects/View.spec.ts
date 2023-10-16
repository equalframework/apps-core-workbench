import { View } from "./View"
import { t1, t2 } from "./testsetsView"

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
        console.log(t2)
        console.log(item.export())
        expect(compareDictRecursif(item.export(),t2)).toBe(0)
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