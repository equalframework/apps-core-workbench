export class ItemTypes {

    static types:{[id:string]:{icon:string,disp:string,truetype:boolean}} =
        {
            "" : {icon:"category",disp:"All",truetype:false},
            "package" : {icon:"inventory",disp:"Packages",truetype:true},
            "class" : {icon:"data_object",disp:"Models",truetype:true},
            "controller" : {icon:"code",disp:"Controllers",truetype:false},
            "route" : {icon:"route",disp:"Routes",truetype:true},
            "view" : {icon:"view_quilt",disp:"Views",truetype:true},
            "menu" : {icon:"menu_open",disp:"App Menu",truetype:true},
            "get" : {icon:"data_array",disp:"Data providers",truetype:true},
            "do" : {icon:"open_in_browser",disp:"Action handlers",truetype:true},
            
        }

    public static get typeDict ():{[id:string]:{icon:string,disp:string}}  {
        let ret:{[id:string]:{icon:string,disp:string}} = {}
        for(let key in ItemTypes.types) {
            ret[key] = {
                icon:ItemTypes.types[key].icon,
                disp:ItemTypes.types[key].disp
            }
        }
        return ret
    }

    public static get trueTypeDict ():{[id:string]:{icon:string,disp:string}}  {
        let ret:{[id:string]:{icon:string,disp:string}} = {}
        for(let key in ItemTypes.types) {
            if(ItemTypes.types[key].truetype)
                ret[key] = {
                    icon:ItemTypes.types[key].icon,
                    disp:ItemTypes.types[key].disp
                }
        }
        return ret
    }

    public static getIconForType(type:string):string {
        console.log(type)
        return this.types[type] ? this.types[type].icon : ""
    }
}