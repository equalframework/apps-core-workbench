import { View } from "./View"
import { rt4, t1, t2, t3, t4, t5 } from "../../view/_objects/testsetsView"

describe("View",() => {
    const empty = {"name":"","description":"","layout":{}}

    it("exports the default empty payload", () => {
        const item = new View({},"list")
        expect(item.export()).toEqual(empty)
    })

    it("creates compliant ids for form layouts", () => {
        const item = new View({
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

        expect(item.id_compliant([]).ok).toBeTrue()
    })

    it("exports list dataset t1", () => {
        const item = new View(t1, "list")
        expect(item.export()).toEqual(t1)
    })

    it("exports list dataset t2", () => {
        const item = new View(t2, "list")
        expect(item.export()).toEqual(t2)
    })

    it("exports form dataset t3 (ignoring generated form id/label fields)", () => {
        const item = new View(t3, "form")
        expectFormEquivalent(item.export(), t3)
    })

    it("normalizes t4 sortable fields under widget", () => {
        const item = new View(t4, "list")
        expect(item.export()).toEqual(rt4)
    })

    it("exports form dataset t5 (ignoring generated form id/label fields)", () => {
        const item = new View(t5, "form")
        expectFormEquivalent(item.export(), t5)
    })

    it("returns the name in getListDisplay", () => {
        const item = new View({ name: "Display Name", layout: { items: [] } }, "list")
        expect(item.getListDisplay()).toBe("Display Name")
    })

    it("adds and deletes filters and exports updated filter list", () => {
        const item = new View({
            name: "With Filters",
            filters: [{ label: "Existing" }],
            layout: { items: [] }
        }, "list")

        item.addFilter()
        expect(item.filters.length).toBe(2)

        item.deleteFilter(0)
        expect(item.filters.length).toBe(1)

        const exported = item.export()
        expect(exported.filters.length).toBe(1)
        expect(exported.filters[0].label).toBe("New Filter")
    })

    it("exports optional view properties when present", () => {
        const item = new View({
            name: "Complex List",
            description: "Coverage payload",
            domain: [["id", "=", 1]],
            filters: [{ id: "f1", label: "Main", description: "desc", clause: ["id", "=", 1] }],
            controller: "custom_collect",
            header: {
                actions: {
                    "ACTION.CREATE": false
                },
                selection: {
                    default: false,
                    actions: [
                        { id: "ACTION.DELETE", visible: false },
                        { id: "selection.custom", label: "Selection", controller: "selection.ctrl" }
                    ]
                }
            },
            actions: [{
                id: "action.main",
                label: "Action",
                controller: "action.ctrl",
                icon: "bolt",
                access: { groups: ["admins"] },
                params: { key: "value" },
                visible: ["id", "=", 1],
                confirm: true
            }],
            routes: [{
                id: "route.main",
                label: "Route",
                description: "route desc",
                route: "/route",
                visible: ["id", "=", 1],
                context: {
                    entity: "demo.entity",
                    view: "list.default",
                    domain: ["id", "=", 1],
                    reset: true
                }
            }],
            access: { groups: ["admins"] },
            operations: {
                total: {
                    amount: {
                        usage: "amount/money:2",
                        operation: "SUM",
                        prefix: "$",
                        suffix: " USD"
                    }
                }
            },
            limit: 25,
            group_by: ["customer_id"],
            order: "customer_id",
            sort: "desc",
            truthy_leftover: "keep-me",
            falsy_leftover: false,
            layout: {
                items: [{ type: "field", value: "id", width: "50%" }]
            }
        }, "list")

        const exported = item.export()

        expect(exported.controller).toBe("custom_collect")
        expect(exported.domain).toEqual([["id", "=", 1]])
        expect(exported.limit).toBe(25)
        expect(exported.group_by).toEqual(["customer_id"])
        expect(exported.order).toBe("customer_id")
        expect(exported.sort).toBe("desc")
        expect(exported.access).toEqual({ groups: ["admins"] })
        expect(exported.operations.total.amount.operation).toBe("SUM")
        expect(exported.routes[0].context.reset).toBeTrue()
        expect(exported.actions[0].confirm).toBeTrue()
        expect(exported.truthy_leftover).toBe("keep-me")
        expect(exported.falsy_leftover).toBeUndefined()
    })

    it("fails id compliance for duplicate action ids", () => {
        const item = new View({
            name: "Duplicate Action Id",
            actions: [
                { id: "dup.action", label: "A", controller: "a.ctrl" },
                { id: "dup.action", label: "B", controller: "b.ctrl" }
            ],
            layout: { items: [] }
        }, "list")

        expect(item.id_compliant([]).ok).toBeFalse()
    })

    it("exports view with group_by operations", () => {
        const item = new View({
            name: "Grouped",
            group_by: [
                "customer_id",
                { field: "amount", operation: ["SUM", "total_amount"] }
            ],
            layout: { items: [] }
        }, "list")
        
        const exported = item.export()
        expect(exported.group_by).toBeDefined()
        expect(exported.group_by.length).toBe(2)
    })

    it("exports view with operations", () => {
        const item = new View({
            name: "With Ops",
            operations: {
                total: {
                    revenue: { usage: "amount", operation: "SUM", prefix: "$" }
                }
            },
            layout: { items: [] }
        }, "list")
        
        const exported = item.export()
        expect(exported.operations).toBeDefined()
        expect(exported.operations.total.revenue.prefix).toBe("$")
    })

    it("exports view with custom selection actions", () => {
        const item = new View({
            name: "Custom Selection",
            header: {
                selection: {
                    actions: [
                        { id: "custom.action", label: "Custom", controller: "custom.ctrl" }
                    ]
                }
            },
            layout: { items: [] }
        }, "list")
        
        const exported = item.export()
        expect(exported.header.selection.actions).toBeDefined()
        expect(exported.header.selection.actions.length).toBe(1)
    })

    it("exports form item with visible domain", () => {
        const item = new View({
            name: "With Visible",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                items: [{
                                    type: "field",
                                    value: "name",
                                    visible: ["id", "!=", null]
                                }]
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        const item_exp = exported.layout.groups[0].sections[0].rows[0].columns[0].items[0]
        expect(item_exp.visible).toBeDefined()
        expect(item_exp.visible[1]).toBe("!=")
    })

    it("exports form with readonly field", () => {
        const item = new View({
            name: "Readonly",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                items: [{
                                    type: "field",
                                    value: "id",
                                    readonly: true
                                }]
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        expect(exported.layout.groups[0].sections[0].rows[0].columns[0].items[0].readonly).toBeTrue()
    })

    it("exports form widget with domain and view", () => {
        const item = new View({
            name: "With Widget",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                items: [{
                                    type: "field",
                                    value: "items",
                                    widget: {
                                        type: "one2many",
                                        view: "nested.list",
                                        domain: ["id", ">", 0]
                                    }
                                }]
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        const widget = exported.layout.groups[0].sections[0].rows[0].columns[0].items[0].widget
        expect(widget.view).toBe("nested.list")
        expect(widget.domain).toBeDefined()
    })

    it("exports list widget with sortable and link", () => {
        const item = new View({
            name: "Sortable List",
            layout: {
                items: [{
                    type: "field",
                    value: "customer_id",
                    widget: {
                        type: "many2one",
                        link: true,
                        sortable: true
                    }
                }]
            }
        }, "list")
        
        const exported = item.export()
        const widget = exported.layout.items[0].widget
        expect(widget.link).toBeTrue()
        expect(widget.sortable).toBeTrue()
    })

    it("exports route with visible domain and context", () => {
        const item = new View({
            name: "With Routes",
            routes: [{
                id: "detail",
                label: "Details",
                route: "/details",
                visible: ["status", "=", "active"],
                context: {
                    entity: "my.entity",
                    view: "detail.form",
                    domain: ["active", "=", true],
                    reset: true
                }
            }],
            layout: { items: [] }
        }, "list")
        
        const exported = item.export()
        const route = exported.routes[0]
        expect(route.visible).toBeDefined()
        expect(route.context.reset).toBeTrue()
        expect(route.context.domain).toBeDefined()
    })

    it("exports column with visible domain and label", () => {
        const item = new View({
            name: "Columns",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                id: "col.1",
                                label: "Main Column",
                                width: 50,
                                visible: ["show_all", "=", true],
                                items: []
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        const column = exported.layout.groups[0].sections[0].rows[0].columns[0]
        expect(column.label).toBe("Main Column")
        expect(column.visible).toBeDefined()
        expect(column.width).toBe("50%")
    })

    it("exports group with label", () => {
        const item = new View({
            name: "Groups",
            layout: {
                groups: [{
                    label: "Main Group",
                    sections: []
                }]
            }
        }, "form")
        
        const exported = item.export()
        expect(exported.layout.groups[0].label).toBe("Main Group")
    })

    it("exports section with label and visible", () => {
        const item = new View({
            name: "Sections",
            layout: {
                groups: [{
                    sections: [{
                        label: "Details",
                        visible: ["advanced", "=", true],
                        rows: []
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        const section = exported.layout.groups[0].sections[0]
        expect(section.label).toBe("Details")
        expect(section.visible).toBeDefined()
    })

    it("detects hasRestrainedVisibility on form items", () => {
        const item = new View({
            name: "Visibility",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                items: [{
                                    type: "field",
                                    value: "secret",
                                    visible: false
                                }]
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const layout = item.layout
        const item_obj = layout.groups[0].sections[0].rows[0].columns[0].items[0]
        expect(item_obj.hasRestrainedVisibility).toBeTrue()
    })

    it("exports action with all extended properties", () => {
        const item = new View({
            name: "Action Props",
            actions: [{
                id: "complex.action",
                label: "Complex",
                controller: "action.ctrl",
                icon: "star",
                description: "A complex action",
                access: { groups: ["admins", "managers"] },
                params: { key1: "val1", key2: "val2" },
                visible: ["role", "=", "admin"],
                confirm: true
            }],
            layout: { items: [] }
        }, "list")
        
        const exported = item.export()
        const action = exported.actions[0]
        expect(action.description).toBe("A complex action")
        expect(action.access.groups.length).toBe(2)
        expect(action.params.key1).toBe("val1")
        expect(action.visible).toBeDefined()
    })

    it("exports predef action with all properties", () => {
        const item = new View({
            name: "PreDef",
            header: {
                actions: {
                    "ACTION.CREATE": {
                        enabled: false
                    }
                }
            },
            layout: { items: [] }
        }, "form")
        
        const exported = item.export()
        expect(exported.header.actions["ACTION.CREATE"]).toEqual([])
    })

    it("row with id compliance check", () => {
        const item = new View({
            name: "Row IDs",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            id: "row.1",
                            columns: []
                        }]
                    }]
                }]
            }
        }, "form")
        
        expect(item.id_compliant([]).ok).toBeTrue()
    })

    it("exports layout with multiple items per column", () => {
        const item = new View({
            name: "Multi Item",
            layout: {
                groups: [{
                    sections: [{
                        rows: [{
                            columns: [{
                                items: [
                                    { type: "field", value: "name" },
                                    { type: "label", value: "Name Field" },
                                    { type: "field", value: "email" }
                                ]
                            }]
                        }]
                    }]
                }]
            }
        }, "form")
        
        const exported = item.export()
        expect(exported.layout.groups[0].sections[0].rows[0].columns[0].items.length).toBe(3)
    })
})

function expectFormEquivalent(actual: any, expected: any): void {
    const normalized = normalizeFormPair(actual, expected)
    expect(normalized.actual).toEqual(normalized.expected)
}

function normalizeFormPair(actual: any, expected: any): { actual: any, expected: any } {
    if (Array.isArray(actual) || Array.isArray(expected)) {
        const actualArray = Array.isArray(actual) ? actual : []
        const expectedArray = Array.isArray(expected) ? expected : []
        const maxLen = Math.max(actualArray.length, expectedArray.length)
        const nextActual: any[] = []
        const nextExpected: any[] = []

        for (let i = 0; i < maxLen; i++) {
            const entry = normalizeFormPair(actualArray[i], expectedArray[i])
            nextActual.push(entry.actual)
            nextExpected.push(entry.expected)
        }

        return { actual: nextActual, expected: nextExpected }
    }

    if (!isPlainObject(actual) && !isPlainObject(expected)) {
        return { actual, expected }
    }

    const actualObj: Record<string, any> = isPlainObject(actual) ? { ...actual } : {}
    const expectedObj: Record<string, any> = isPlainObject(expected) ? { ...expected } : {}

    for (const optionalKey of ["id", "label"]) {
        const hasActual = Object.prototype.hasOwnProperty.call(actualObj, optionalKey)
        const hasExpected = Object.prototype.hasOwnProperty.call(expectedObj, optionalKey)

        if (hasActual !== hasExpected) {
            delete actualObj[optionalKey]
            delete expectedObj[optionalKey]
        }
    }

    const keys = new Set([...Object.keys(actualObj), ...Object.keys(expectedObj)])
    for (const key of keys) {
        const child = normalizeFormPair(actualObj[key], expectedObj[key])
        actualObj[key] = child.actual
        expectedObj[key] = child.expected
    }

    return { actual: actualObj, expected: expectedObj }
}

function isPlainObject(value: any): boolean {
    return !!value && typeof value === "object" && !Array.isArray(value)
}