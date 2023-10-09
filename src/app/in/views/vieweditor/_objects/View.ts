import { cloneDeep } from "lodash"

abstract class ViewElement {
    public static num: number = 0
    public leftover: any = {}

    constructor() { }

    getListDisplay(): string {
        return ""
    }

    isValid(): boolean {
        return false
    }

    export(): any {
        let result:any = {}
        for(let key in this.leftover) {
            if(this.leftover[key]) {
                result[key] = this.leftover[key]
            }
        }
        return result
    }

    id_compliant(id_list: string[]): { ok: boolean, id_list: string[] } {
        return { ok: true, id_list: id_list }
    }
}

class View extends ViewElement {
    public layout: ViewLayout = new ViewLayout()
    public name: string = ""
    public description: string = ""
    public type: string = "form"
    public domain: ViewDomain = new ViewDomain()
    public filters: ViewFilter[] = []
    public controller: string = "core_model_collect"
    public header: ViewHeader
    public actions: ViewAction[] = []


    public _has_domain = false
    public _has_header = false
    public _has_filter = false
    public _has_actions = false
    public _has_selection_actions = false

    constructor(schem: any = {}, type: string) {
        let scheme = cloneDeep(schem)
        super()
        this.type = type
        if (scheme['name']) {
            this.name = scheme['name']
            delete scheme['name']
        }
        if (scheme['description']) {
            this.description = scheme['description']
            delete scheme['description']
        }
        if (scheme['domain']) {
            this.domain = new ViewDomain(scheme['domain'])
            this._has_domain = true
            delete scheme['domain']
        }
        if (scheme['filters']) {
            for (let v of scheme['filters']) {
                this.filters.push(new ViewFilter(v))
            }
            this._has_filter = true
            delete scheme['filters']
        }
        if (scheme['layout']) {
            this.layout = new ViewLayout(scheme['layout'])
            delete scheme['layout']
        }
        if (scheme['controller']) {
            this.controller = scheme['controller']
            delete scheme['controller']
        }
        if (scheme['header']) {
            this.header = new ViewHeader(scheme['header'], this.type)
            this._has_header = true
            delete scheme['header']
        } else this.header = new ViewHeader({}, this.type)
        if (scheme['actions']) {
            this._has_actions = true
            scheme['actions'].forEach((action: any) => this.actions.push(new ViewAction(action, true)))
            delete scheme['actions']
        }
        this.leftover = scheme
    }

    override getListDisplay(): string {
        return this.name
    }

    addFilter() {
        this.filters.push(new ViewFilter({ "label": "New Filter" }))
    }

    deleteFilter(index: number) {
        this.filters.splice(index, 1)
    }

    override export(): any {
        let result = super.export()
        result['name'] = this.name
        result['description'] = this.description
        if (this._has_header) {
            result['header'] = this.header.export()
        }
        if (this.controller !== "core_model_collect") result['controller'] = this.controller
        if (this._has_domain) result['domain'] = this.domain.dom
        if (this._has_filter) {
            result['filters'] = []
            this.filters.forEach(filter => result['filters'].push(filter.export()))
        }
        if (this._has_actions) {
            result['actions'] = []
            this.actions.forEach(action => result['actions'].push(action.export()))
        }
        result['layout'] = this.layout.export()
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        // HEADER
        if (this._has_header) {
            ret = this.header.id_compliant(ret.id_list)
            if (!ret.ok) return { ok: false, id_list: ret.id_list }
        }
        // ACTIONS
        if (this._has_actions) {
            for (let action of this.actions) {
                ret = action.id_compliant(ret.id_list)
                if (!ret.ok) return { ok: false, id_list: ret.id_list }
            }
        }
        // LAYOUT
        ret = this.layout.id_compliant(ret.id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewLayout extends ViewElement {
    public groups: ViewGroup[] = []
    public items: ViewItem[] = []

    constructor(scheme: any = {}) {
        super()
        if (scheme["items"]) {
            for (let v of scheme["items"]) {
                this.items.push(new ViewItem(v,0))
            }
            delete scheme["items"]
        }
        if (scheme["groups"]) {
            for (let v of scheme["groups"]) {
                this.groups.push(new ViewGroup(v))
            }
            delete scheme["groups"]
        }
        this.leftover = scheme
    }

    newViewItem() {
        this.items.push(new ViewItem())
    }

    deleteItem(index: number) {
        this.items.splice(index, 1)
    }

    override getListDisplay(): string {
        return "Layout"
    }

    override export(): any {
        let result = super.export()
        if (this.groups.length > 0) {
            result['groups'] = []
            this.groups.forEach(group => result['groups'].push(group.export()))
        }
        if (this.items.length > 0) {
            result['items'] = []
            this.items.forEach(item => result['items'].push(item.export()))
        }
        console.log(result)
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        for (let group of this.groups) {
            ret = group.id_compliant(ret.id_list)
            if (!ret.ok) return { ok: false, id_list: ret.id_list }
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewGroup extends ViewElement {
    public sections: ViewSection[] = []
    public label: string = ""
    public id: string = ""

    constructor(scheme: any = {}) {
        super()
        if (scheme['sections']) {
            for (let v of scheme["sections"]) {
                this.sections.push(new ViewSection(v))
            }
            delete scheme['sections']
        }
        if (scheme['label']) {
            this.label = scheme['label']
            delete scheme['label']
        }
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (this.id === "") this.id = "group." + (ViewGroup.num++)
        this.leftover = scheme
    }

    override getListDisplay(): string {
        return "Group"
    }

    override export(): any {
        let result = super.export()
        if (this.label !== "") result['label'] = this.label
        result['id'] = this.id
        result['sections'] = []
        this.sections.forEach(section => result['sections'].push(section.export()))
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
        ret.id_list = [...ret.id_list, this.id]
        for (let section of this.sections) {
            ret = section.id_compliant(ret.id_list)
            if (!ret.ok) return { ok: false, id_list: ret.id_list }
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewSection extends ViewElement {
    public label: string = ""
    public id: string = ""
    public rows: ViewRow[] = []
    public visible: ViewDomain = new ViewDomain();

    public _has_domain: boolean = false

    constructor(scheme: any = {}) {
        super()
        if (scheme['label']) {
            this.label = scheme.label
            delete scheme['label']
        }
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (scheme['rows']) {
            for (let v of scheme["rows"]) {
                this.rows.push(new ViewRow(v))
            }
            delete scheme['rows']
        }
        if (scheme['visible']) {
            this._has_domain = true
            this.visible = new ViewDomain(scheme['visible'])
            delete scheme['visible']
        }
        if (this.id === "") this.id = "section." + (ViewSection.num++)
        this.leftover = scheme
    }

    override getListDisplay(): string {
        return this.label ? this.label : this.id
    }

    override export() {
        let result = super.export()
        if (this.label !== "") result['label'] = this.label
        result['id'] = this.id
        if (this._has_domain) result['visible'] = this.visible.dom
        result['rows'] = []
        this.rows.forEach(row => result['rows'].push(row.export()))

        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
        ret.id_list = [...ret.id_list, this.id]
        for (let row of this.rows) {
            ret = row.id_compliant(ret.id_list)
            if (!ret.ok) return { ok: false, id_list: ret.id_list }
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewRow extends ViewElement {
    public id: string = ""
    public label: string = ""
    public columns: ViewColumn[] = []
    public visible: ViewDomain = new ViewDomain()

    public _has_domain: boolean = false

    constructor(scheme: any = {}) {
        super()
        //if(scheme['height']) this.height = scheme['height']
        if (scheme['columns']) {
            for (let v of scheme["columns"]) {
                this.columns.push(new ViewColumn(v))
            }
            delete scheme['columns']
        }
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (scheme['label']) {
            this.label = scheme['label']
            delete scheme['label']
        }
        if (scheme['visible']) {
            this.visible = new ViewDomain(scheme['visible'])
            this._has_domain = true
            delete scheme['visible']
        }
        if (this.id === "") this.id = "row." + (ViewRow.num++)
        this.leftover = scheme
    }

    get totalwidth(): number {
        let ret = 0
        this.columns.forEach(item => ret += item.width)
        return ret > 0 ? ret : 100
    }

    override getListDisplay(): string {
        return "Row"
    }

    override export(): any {
        let result = super.export()
        result['id'] = this.id
        if (this.label !== "") result['label'] = this.label
        if (this._has_domain) result['visible'] = this.visible.dom
        result['columns'] = []
        this.columns.forEach(column => result['columns'].push(column.export()))
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
        ret.id_list = [...ret.id_list, this.id]
        for (let column of this.columns) {
            ret = column.id_compliant(ret.id_list)
            if (!ret.ok) return { ok: false, id_list: ret.id_list }
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewColumn extends ViewElement {
    public label: string = ""
    public id: string = ""
    public width: number = 100
    public items: ViewItem[] = []
    public visible: ViewDomain = new ViewDomain()

    public _has_domain: boolean = false

    constructor(scheme: any = {}) {
        super()
        if (scheme['width']) {
            this.width = Number.parseInt(scheme['width'])
            delete scheme['width']
        }
        if (scheme['items']) {
            for (let v of scheme["items"]) {
                this.items.push(new ViewItem(v,1))
            }
            delete scheme['items']
        }
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (scheme['label']) {
            this.label = scheme['label']
            delete scheme['label']
        }
        if (scheme['visible']) {
            this.visible = new ViewDomain(scheme['visible'])
            this._has_domain = true
            delete scheme['visible']
        }
        if (this.id === "") this.id = "column." + (ViewColumn.num++)
        this.leftover = scheme
    }
    override getListDisplay(): string {
        return "Column"
    }

    override export() {
        let result = super.export()
        result['id'] = this.id
        if (this.label !== "") result['label'] = this.label
        if (this._has_domain) result['visible'] = this.visible.dom
        result['width'] = this.width + '%'
        result['items'] = []
        this.items.forEach(item => result['items'].push(item.export()))
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
        ret.id_list = [...ret.id_list, this.id]
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewItem extends ViewElement {
    public type: string = ""
    public value: string = ""
    public width: number = 100
    public readonly:boolean = false
    public visible: ViewDomain = new ViewDomain()
    public visible_bool: boolean = true
    public widgetList: ViewListWidget = new ViewListWidget()
    public widgetForm: ViewFormWidget = new ViewFormWidget()
    public viewtype:number = 0
    public has_domain: boolean = false
    public has_widget: boolean = false
    public is_visible_domain:boolean = false
    public label:string = ""

    public get valueIsSelect(): boolean {
        return this.type !== "label"
    }

    public static get typeList(): string[] {
        return ["field", "label"]
    }

    constructor(scheme: any = {},type:number=0) {
        super()
        this.viewtype = type
        if (scheme['type']) {
            this.type = scheme['type']
            delete scheme['type']
        }
        if (scheme['value']) {
            this.value = scheme['value']
            delete scheme['value']
        }
        if (scheme['width']) {
            this.width = Number.parseInt(scheme['width'])
            delete scheme['width']
        }
        console.log(scheme['sortable'])
        if (scheme['sortable']) {
            console.log('pop')
            if(!scheme['widget']){
                scheme['widget'] = {}
            }
            scheme['widget']['sortable'] = scheme['sortable']
            delete scheme['sortable']
        }
        console.log(scheme['readonly'])
        if (scheme['readonly']) {
            this.readonly = scheme['readonly']
            delete scheme['readonly']
        }
        if (scheme['visible'] !== undefined) {
            if (typeof (scheme['visible']) === typeof (true)) {
                this.visible_bool = scheme['visible']
            } else {
                this.visible = new ViewDomain(scheme['visible'])
                this.is_visible_domain = true
            }
            this.has_domain = true
            delete scheme['visible']
        }
        if (scheme['widget']) {
            if(this.viewtype === 0) {
                this.widgetList = new ViewListWidget(scheme['widget'])
            } else {
                this.widgetForm = new ViewFormWidget(scheme['widget'])
            }
            this.has_widget = true
            delete scheme['widget']
        }
        if(scheme['label']){
            this.label = scheme['label']
            delete scheme['label']
        }
        if (!ViewItem.typeList.includes(this.type)) this.type = ""
        this.leftover = scheme
    }

    override export() {
        let result = super.export()
        result['type'] = this.type
        result['value'] = this.value
        result['width'] = this.width + "%"
        if(this.label.trim() !== "" && this.type === "field") {
            result['label'] = this.label.trim()
        }
        if (this.has_domain) {
            if (this.is_visible_domain)
                result['visible'] = this.visible.dom
            else
                result['visible'] = this.visible_bool
        }
        if (this.has_widget){
            if(this.viewtype === 0) {
                result['widget'] = this.widgetList.export()
            } else {
                result['widget'] = this.widgetForm.export()
            }
        }
        return result
    }
}

class ViewListWidget extends ViewElement {
    public sortable: boolean = false
    public link: boolean = false
    public type: string = ""
    public values: string[] = []

    constructor(scheme: any = {}, type:number=0) {
        super()
        if (scheme['link']) {
            this.link = scheme['link']
            delete scheme['link']
        }
        if (scheme['type']) {
            this.type = scheme['type']
            delete scheme['type']
        }
        if (scheme['values']) {
            this.values = scheme['values']
            delete scheme['values']
        }
        if (scheme['sortable']) {
            this.sortable = scheme['sortable']
            delete scheme['sortable']
        }
        this.leftover = scheme
    }

    override export(): any {
        let result = super.export()
        if (this.link)
            result['link'] = this.link
        if (this.sortable)
            result['sortable'] = this.sortable
        if (this.type !== "")
            result['type'] = this.type
        if (this.type === "select")
            result['values'] = this.values
        return result
    }
}

class ViewFormWidget extends ViewElement {
    public link: boolean = false
    public heading: boolean = false
    public type: string = ""
    public values: string[] = []
    public header:ViewHeader = new ViewHeader({},"list")
    public view:string = ""

    public _has_header = false
    public _has_view = false

    constructor(scheme: any = {}) {
        super()
        if (scheme['link']) {
            this.link = scheme['link']
            delete scheme['link']
        }
        if (scheme['heading']) {
            this.heading = scheme['heading']
            delete scheme['heading']
        }
        if (scheme['type']) {
            this.type = scheme['type']
            delete scheme['type']
        }
        if (scheme['values']) {
            this.values = scheme['values']
            delete scheme['values']
        }
        if (scheme['header']) {
            this.header = new ViewHeader(scheme['header'],"list")
            this._has_header = true
            delete scheme['header']
        }
        if (scheme["view"]){
            this.view = scheme['view']
            this._has_view = true
            delete scheme['view']
        }
        this.leftover = scheme
    }

    override export(): any {
        let result = super.export()
        if (this.link)
            result['link'] = this.link
        if (this.heading)
            result['heading'] = this.heading
        if (this.type !== "")
            result['type'] = this.type
        if (this.type === "select")
            result['values'] = this.values
        if(this._has_header) {
            result['header'] = this.header.export()
        }
        if(this._has_view) {
            result['view'] = this.view
        }
        return result
    }
}

class ViewDomain {
    public dom: any = []

    constructor(scheme: any = []) {
        this.dom = cloneDeep(scheme)
    }
}

class ViewFilter extends ViewElement {
    public id: string = ""
    public label: string = ""
    public description: string = ""
    public clause: ViewClause = new ViewClause()

    constructor(scheme: any = {}) {
        super()
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (scheme['label']) {
            this.label = scheme['label']
            delete scheme['label']
        }
        if (scheme['description']) {
            this.description = scheme['description']
            delete scheme['description']
        }
        if (scheme['clause']) {
            this.clause = new ViewClause(scheme['clause'])
            delete scheme['clause']
        }
        if (this.id === "") this.id = "Filter." + (ViewFilter.num++)
        this.leftover = scheme
    }

    override export() {
        let result = super.export()
        result["id"] = this.id
        result["label"] = this.label
        result["description"] = this.description
        result["clause"] = this.clause.arr
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return ret
        if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
        ret.id_list = [...ret.id_list, this.id]
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewHeader extends ViewElement {
    actions: { [id: string]: { acts: ViewAction[], enabled: boolean, default: boolean } }
    selection_actions: ViewAction[] = []
    selection_default: boolean = true

    _has_actions = false
    _has_selection_actions = false

    static get actions_for_list(): { [id: string]: { acts: ViewAction[], enabled: boolean, default: boolean } } {
        return {
            "ACTION.SELECT": { acts: [], enabled: true, default: true },
            "ACTION.CREATE": { acts: [], enabled: true, default: true },
            "ACTION.SAVE": { acts: [], enabled: true, default: true },
            "ACTION.CANCEL": { acts: [], enabled: true, default: true },
            "ACTION.EDIT_INLINE": { acts: [], enabled: true, default: true },
            "ACTION.EDIT_BULK": { acts: [], enabled: true, default: true },
            "ACTION.CLONE": { acts: [], enabled: true, default: true },
            "ACTION.ARCHIVE": { acts: [], enabled: true, default: true },
            "ACTION.DELETE": { acts: [], enabled: true, default: true },
        }
    }

    static get actions_for_form(): { [id: string]: { acts: ViewAction[], enabled: boolean, default: boolean } } {
        return {
            "ACTION.CREATE": { acts: [], enabled: true, default: true },
            "ACTION.EDIT": { acts: [], enabled: true, default: true },
            "ACTION.SAVE": { acts: [], enabled: true, default: true },
            "ACTION.CANCEL": { acts: [], enabled: true, default: true },
        }
    }

    constructor(scheme: any = {}, type: string) {
        super()
        if (type === 'list') {
            this.actions = ViewHeader.actions_for_list
        } else {
            this.actions = ViewHeader.actions_for_form
        }
        if (scheme['actions']) {
            this._has_actions = true
            for (let key in this.actions) {
                console.log(key)
                console.log(scheme["actions"][key])
                // This is done to differenciate undefined value of false value (dynamic typing sucks)
                if (typeof (scheme["actions"][key]) !== typeof (undefined)) {
                    if (typeof (scheme["actions"][key]) === typeof (true)) {
                        if (scheme['actions'][key] === false)
                            this.actions[key].enabled = false
                        if (scheme['actions'][key] === true)
                            this.actions[key].enabled = true
                    }
                    else {
                        this.actions[key].default = false
                        this.actions[key].acts = []
                        scheme['actions'][key].forEach((act: any) => this.actions[key].acts.push(new ViewAction(act)))
                    }
                }
            }
            delete scheme['actions']
        }
        if (scheme['selection']) {
            if (scheme['selection']['default'] !== undefined) {
                this.selection_default = scheme['selection']['default']
            }
            if (scheme['selection']['actions']) {
                this._has_selection_actions = true
                scheme['selection']['actions'].forEach((action: any) => this.selection_actions.push(new ViewAction(action)))
            }
            delete scheme['selection']
        }
        this.leftover = scheme
    }

    override export() {
        let result = super.export()
        if (this._has_actions) {
            result["actions"] = {}
            for (let key in this.actions) {
                if (!this.actions[key].enabled) {
                    result["actions"][key] = false
                    continue
                }
                if (this.actions[key].default) continue
                result["actions"][key] = []
                this.actions[key].acts.forEach(action => {
                    result["actions"][key].push(action.export())
                })
            }
        }
        if (!this.selection_default || this._has_selection_actions) {
            result['selection'] = {}
            if (!this.selection_default) result['selection']['default'] = false
            if (this._has_selection_actions) {
                result['selection']['actions'] = []
                this.selection_actions.forEach(action => result['selection']['actions'].push(action.export()))
            }
        }
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return { ok: false, id_list: ret.id_list }
        if (this._has_actions) {
            for (let key in this.actions) {
                if (ret.id_list.includes(key)) return { ok: false, id_list: [...ret.id_list, key] }
                ret.id_list = [...ret.id_list, key]
                if (!this.actions[key].default && this.actions[key].enabled) {
                    for (let action of this.actions[key].acts) {
                        ret = action.id_compliant(ret.id_list)
                        if (!ret.ok) return ret
                    }
                }
            }
        }
        if (this._has_selection_actions) {
            for (let action of this.selection_actions) {
                ret = action.id_compliant(ret.id_list)
                if (!ret.ok) return ret
            }
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewAction extends ViewElement {
    id: string = ""
    controller: string = ""
    icon: string = ""
    description: string = ""
    label: string = ""
    params: any = {}
    access = { "groups": ["users"] }
    visible = new ViewDomain()


    confirm: boolean = false

    _domainable = false
    _has_domain = false
    _has_access = false
    _has_params = false

    static predef = [
        "SAVE_AND_CLOSE",
        "SAVE_AND_CONTINUE",
        "SAVE_AND_VIEW",
        "SAVE_AND_EDIT",
        "CREATE",
        "ADD",
    ]

    get is_predifined(): boolean {
        for (let item of ViewAction.predef) {
            if (this.id === item) return true
        }
        return false
    }

    constructor(scheme: any = {}, domainable = false) {
        super()
        if (scheme['controller']) {
            this.controller = scheme['controller']
            delete scheme['controller']
        }
        if (scheme['description']) {
            this.description = scheme['description']
            delete scheme['description']
        }
        if (scheme['id']) {
            this.id = scheme['id']
            delete scheme['id']
        }
        if (scheme['label']) {
            this.label = scheme['label']
            delete scheme['label']
        }
        if (scheme['icon']) {
            this.icon = scheme['icon']
            delete scheme['icon']
        }
        if (scheme["access"]) {
            this.access = scheme["access"]
            this._has_access = true
            delete scheme['access']
        }
        if (scheme["params"]) {
            this._has_params = true
            this.params = scheme["params"]
            delete scheme['params']
        }
        if (scheme['confirm'] !== undefined) {
            this.confirm = scheme['confirm']
            delete scheme['confirm']
        }
        if (domainable) {
            this._domainable = true
            if (scheme['visible']) {
                this.visible = new ViewDomain(scheme['visible'])
                this._has_domain = true
                delete scheme['visible']
            }
        }
        this.leftover = scheme
    }

    override export() {
        let result = super.export()
        result["id"] = this.id
        if (this._has_access) {
            result["access"] = this.access
        }
        if (this.is_predifined) return result
        result["controller"] = this.controller
        result["icon"] = this.icon
        result["description"] = this.description
        result["label"] = this.label
        if (this._domainable && this._has_domain) result['visible'] = this.visible.dom
        if (this._has_params) result["params"] = this.params
        result['confirm'] = this.confirm
        return result
    }

    override id_compliant(id_list: string[]): { ok: boolean; id_list: string[]; } {
        let ret = super.id_compliant(id_list)
        if (!ret.ok) return ret
        if (!this.is_predifined) {
            if (ret.id_list.includes(this.id) || this.id == "") return { ok: false, id_list: [...ret.id_list, this.id] }
            ret.id_list = [...ret.id_list, this.id]
        }
        return { ok: true, id_list: ret.id_list }
    }
}

class ViewClause {
    public arr: string[] = []

    constructor(scheme: any = []) {
        this.arr = cloneDeep(scheme)
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
    ViewListWidget,
    ViewFormWidget,
    ViewHeader,
    ViewAction
}

