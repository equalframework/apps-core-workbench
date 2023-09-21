abstract class ViewElement {
    public static num:number = 0

    constructor() {}

    getListDisplay():string {
        return ""
    }

    isValid():boolean {
        return false
    }
}

class View extends ViewElement{
    public layout:ViewLayout = new ViewLayout()
    public name:string = ""
    public description:string = ""
    public type:string = "form"
    public domain:ViewDomain = new ViewDomain()
    public filters:ViewFilter[] = []

    constructor(scheme:any={},type:string) {
        super()
        this.type = type
        if(scheme['name']) this.name = scheme['name']
        if(scheme['description']) this.description = scheme['description']
        if(scheme['domain']) this.domain = new ViewDomain(scheme['domain'])
        if(scheme['filters']){
            for(let v of scheme['filters']){
                this.filters.push(new ViewFilter(v))
            }
        }
        if(scheme['layout']) this.layout = new ViewLayout(scheme['layout'])
    }

    override getListDisplay(): string {
        return this.name
    }

    addFilter() {
        this.filters.push(new ViewFilter({"label":"New Filter"}))
    }

    deleteFilter(index:number) {
        this.filters.splice(index,1)
    }
}

class ViewLayout extends ViewElement {
    public groups:ViewGroup[] = []
    public items:ViewItem[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme["items"]){
            for(let v of scheme["items"]){
                this.items.push(new ViewItem(v))
            }
        }
        if(scheme["groups"]){
            for(let v of scheme["groups"]){
                this.groups.push(new ViewGroup(v))
            }
        }
    }

    newViewItem() {
        this.items.push(new ViewItem())
    }

    deleteItem(index:number) {
        this.items.splice(index,1)
    }

    override getListDisplay(): string {
        return "Layout"
    }
}

class ViewGroup extends ViewElement {
    public sections:ViewSection[] = []
    public label:string = ""
    public id:string = ""

    constructor(scheme:any={}) {
        super()
        if(scheme['sections']) {
            for(let v of scheme["sections"]){
                this.sections.push(new ViewSection(v))
            }
        }
        if(scheme['label']) this.label = scheme['label']
        if(this.label==="") this.label = "UNNAMED"
        if(this.id==="") this.id = "Group."+(ViewGroup.num++)
    }

    override getListDisplay(): string {
        return "Group"
    }
}

class ViewSection extends ViewElement {
    public label:string = ""
    public id:string = ""
    public rows:ViewRow[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme['label']) this.label = scheme.label
        if(scheme['id']) this.id = scheme['id']
        if(scheme['rows']) {
            for(let v of scheme["rows"]){
                this.rows.push(new ViewRow(v))
            }
        }
        if(this.label==="") this.label = "UNNAMED"
        if(this.id==="") this.id = "Section."+(ViewSection.num++)
    }

    override getListDisplay(): string {
        return this.label ? this.label : this.id
    }
}

class ViewRow extends ViewElement {
    public id:string = ""
    public label:string = ""
    public columns:ViewColumn[] = []

    constructor(scheme:any={}) {
        super()
        //if(scheme['height']) this.height = scheme['height']
        if(scheme['columns']){
            for(let v of scheme["columns"]){
                this.columns.push(new ViewColumn(v))
            }
        }
        if(scheme['id']) this.id = scheme['id']
        if(scheme['label']) this.label = scheme['label']
        if(this.label==="") this.label = "UNNAMED"
        if(this.id==="") this.id = "Row."+(ViewRow.num++)
    }

    get totalwidth():number {
        let ret = 0
        this.columns.forEach(item => ret += item.width)
        return ret > 0 ? ret : 100
    }

    override getListDisplay(): string {
        return "Row"
    }
}

class ViewColumn extends ViewElement {
    public label:string = ""
    public id:string = ""
    public width:number = 100
    public items:ViewItem[] = []

    constructor(scheme:any={}) {
        super()
        if(scheme['width']) this.width = Number.parseInt(scheme['width'])
        if(scheme['items']) {
            for(let v of scheme["items"]){
                this.items.push(new ViewItem(v))
            }
        }
        if(scheme['id']) this.id = scheme['id']
        if(scheme['label']) this.label = scheme['label']
        if(this.label==="") this.label = "UNNAMED"
        if(this.id==="") this.id = "Column."+(ViewColumn.num++)
    }
    override getListDisplay(): string {
        return "Column"
    }
}

class ViewItem extends ViewElement {
    public type:string = ""
    public value:string = ""
    public width:number = 100
    public sortable:boolean = false
    public readonly:boolean = false
    public visible:ViewDomain = new ViewDomain()
    public widget:ViewWidget = new ViewWidget()
    public has_domain:boolean = false
    public has_widget:boolean = false

    public get valueIsSelect():boolean {
        return this.type !== "label"
    }

    public static get typeList():string[] {
        return ["field","label"]
    }

    constructor(scheme:any={}) {
        super()
        if(scheme['type']) this.type = scheme['type']
        if(scheme['value']) this.value = scheme['value']
        if(scheme['width']) this.width = Number.parseInt(scheme['width'])
        if(scheme['sortable']) this.sortable = scheme['sortable']
        if(scheme['readonly']) this.readonly = scheme['readonly']
        if(scheme['visible']) {
            this.visible = new ViewDomain(scheme['visible'])
            this.has_domain = true
        }
        if(scheme['widget']){
            this.widget = new ViewWidget(scheme['widget'])
            this.has_widget = true
        }
        if(!ViewItem.typeList.includes(this.type)) this.type = ""
    }
}

class ViewWidget {
    public link:boolean = false
    public heading:boolean = false
    public type:string = ""
    public values:string[] = []

    constructor(scheme:any={}) {
        if(scheme['link']) this.link = scheme['link']
        if(scheme['heading']) this.heading = scheme['heading']
        if(scheme['type']) this.type = scheme['type']
        if(scheme['values']) this.values = scheme['values']
    }
}

class ViewDomain {
    public dom:any[][] = []

    constructor(scheme:any=[]) {
        if(scheme)
            this.dom = scheme
    }
}

class ViewFilter extends ViewElement {
    public id:string = ""
    public label:string = ""
    public description:string = ""
    public clause:ViewClause = new ViewClause()

    constructor(scheme:any={}) {
        super()
        if(scheme['id']) this.id = scheme['id']
        if(scheme['label']) this.label = scheme['label']
        if(scheme['description']) this.description = scheme['description']
        if(scheme['clause']) this.clause = new ViewClause(scheme['clause'])
        if(this.id==="") this.id = "Filter."+(ViewFilter.num++)
        if(this.label==="") this.label = "UNNAMED"
    }
}

class ViewClause {
    public arr:string[] = []

    constructor(scheme:any={}) {
        this.arr = scheme
    }
}

export {
    View,
    ViewClause,
    ViewColumn,
    ViewFilter,
    ViewDomain,
    ViewLayout,
    ViewSection,
    ViewRow,
    ViewItem,
    ViewElement,
    ViewGroup,
    ViewWidget
}