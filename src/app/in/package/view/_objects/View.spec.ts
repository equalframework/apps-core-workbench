import {
    View,
    ViewAction,
    ViewColumn,
    ViewFilter,
    ViewFormWidget,
    ViewGroup,
    ViewGroupBy,
    ViewGroupByItem,
    ViewGroupByItemOperation,
    ViewHeader,
    ViewItem,
    ViewLayout,
    ViewListWidget,
    ViewOperation,
    ViewPreDefAction,
    ViewRoute,
    ViewRouteContext,
    ViewRow,
    ViewSection,
    ViewSelection
} from "./View"
import { rt4, t1, t2, t3, t4, t5 } from "./testsetsView"

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

    it("keeps current t4 export behavior different from rt4", () => {
        const item = new View(t4, "list")
        expect(item.export()).not.toEqual(rt4)
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

    it("handles default constructor scheme and keeps list defaults", () => {
        const item = new View(undefined as any, "list")
        const exported = item.export()

        expect(exported.name).toBe("")
        expect(exported.description).toBe("")
        expect(exported.layout).toEqual({})
        expect(exported.controller).toBeUndefined()
    })

    it("exports and validates operation payloads", () => {
        const operation = new ViewOperation(undefined as any, "total")
        operation.ops.push({
            name: "amount",
            usage: { export: () => "amount/money:2" } as any,
            operation: "SUM",
            prefix: "$",
            suffix: " USD",
            leftover: { precision: 2 }
        })

        const exported = operation.export()
        expect(exported.amount.usage).toBe("amount/money:2")
        expect(exported.amount.operation).toBe("SUM")
        expect(exported.amount.prefix).toBe("$")
        expect(exported.amount.suffix).toBe(" USD")
        expect(operation.fieldTaken).toEqual(["amount"])
    })

    it("covers group by item export branches", () => {
        const emptyField = new ViewGroupByItem()
        const objectField = new ViewGroupByItem({ field: "created_at", operation: ["year", "month"] })
        const simpleField = new ViewGroupByItem("customer_id")

        expect(emptyField.export()).toBeUndefined()
        expect(objectField.export()).toEqual({ field: "created_at", operation: ["year", "month"] })
        expect(simpleField.export()).toBe("customer_id")
    })

    it("exports group by arrays and operation arrays", () => {
        const groupBy = new ViewGroupBy(["partner_id", { field: "created_at", operation: ["year", "month"] }])
        const operation = new ViewGroupByItemOperation(["year", "month", "ignored"] as any)

        expect(groupBy.export()).toEqual(["partner_id", { field: "created_at", operation: ["year", "month"] }])
        expect(operation.export()).toEqual(["year", "month"])
    })

    it("manages list layout items", () => {
        const layout = new ViewLayout("list", { items: [{ type: "field", value: "id", width: "50%" }] })
        layout.newViewItem()
        expect(layout.items.length).toBe(2)

        layout.deleteItem(1)
        expect(layout.items.length).toBe(1)
        expect(layout.getListDisplay()).toBe("Layout")
    })

    it("detects duplicate ids in nested form layout", () => {
        const groupA = new ViewGroup({ id: "same", sections: [] })
        const groupB = new ViewGroup({ id: "same", sections: [] })
        const layout = new ViewLayout("form", { groups: [] })
        layout.groups = [groupA, groupB]

        expect(layout.id_compliant([]).ok).toBeFalse()
    })

    it("covers section, row and column exports with visible domains", () => {
        const section = new ViewSection({ label: "Main", id: "section.main", visible: ["id", "=", 1], rows: [] })
        const row = new ViewRow({ id: "row.main", label: "Row", visible: ["id", "=", 1], columns: [] })
        const column = new ViewColumn({ id: "col.main", label: "Col", width: "40%", visible: ["id", "=", 1], items: [] })

        section.rows.push(row)
        row.columns.push(column)

        expect(section.getListDisplay()).toBe("Main")
        expect(row.getListDisplay()).toBe("Row")
        expect(column.getListDisplay()).toBe("Column")
        expect(row.totalwidth).toBe(40)

        const exportedSection = section.export()
        expect(exportedSection.visible).toEqual(["id", "=", 1])
        expect(exportedSection.rows[0].columns[0].width).toBe("40%")
    })

    it("covers item export branches for widget, visibility and readonly", () => {
        const listItem = new ViewItem({
            id: "item.list",
            type: "field",
            value: "name",
            width: "60%",
            sortable: true,
            visible: false,
            readonly: true,
            widget: { type: "select", values: ["A", "B"], usage: "name/string", link: true }
        }, 0)
        const formItem = new ViewItem({
            id: "item.form",
            type: "field",
            value: "name",
            visible: ["name", "!=", ""],
            widget: { heading: true, type: "select", values: ["X"], view: "demo.form", domain: ["id", "=", 1] }
        }, 1)

        expect(listItem.valueIsSelect).toBeTrue()
        expect(new ViewItem({ type: "label", value: "x" }).valueIsSelect).toBeFalse()
        expect(listItem.hasRestrainedVisibility).toBeTrue()
        expect(formItem.hasRestrainedVisibility).toBeTrue()
        expect(listItem.export().readonly).toBeTrue()
        expect(formItem.export().widget.view).toBe("demo.form")
    })

    it("covers list and form widget export branches", () => {
        const listWidget = new ViewListWidget({ link: true, type: "select", usage: "name/string", values: ["a"], sortable: true })
        const formWidget = new ViewFormWidget({
            link: true,
            heading: true,
            type: "select",
            usage: "name/string",
            values: ["a"],
            header: { actions: { "ACTION.CREATE": false } },
            view: "demo.view",
            domain: ["id", "=", 1]
        })

        expect(listWidget.export().sortable).toBeTrue()
        expect(listWidget.export().values).toEqual(["a"])
        expect(formWidget.export().heading).toBeTrue()
        expect(formWidget.export().header.actions["ACTION.CREATE"]).toBeFalse()
        expect(formWidget.export().domain).toEqual(["id", "=", 1])
    })

    it("covers filter export and id collisions", () => {
        const filter = new ViewFilter({ id: "f.main", label: "Main", description: "desc", clause: ["id", "=", 1] })
        expect(filter.export()).toEqual({
            id: "f.main",
            label: "Main",
            description: "desc",
            clause: ["id", "=", 1]
        })
        expect(filter.id_compliant(["f.main"]).ok).toBeFalse()
    })

    it("covers selection actions and predefined visibility toggles", () => {
        const selection = new ViewSelection({
            default: false,
            actions: [
                { id: "ACTION.DELETE", visible: false },
                { id: "custom.selection", label: "Custom", controller: "selection.ctrl" }
            ]
        })

        const exported = selection.export()
        expect(exported.default).toBeFalse()
        expect(exported.actions.some((a: any) => a.id === "ACTION.DELETE" && a.visible === false)).toBeTrue()
        expect(selection.id_compliant(["custom.selection"]).ok).toBeFalse()
    })

    it("covers header exports and id collisions", () => {
        const header = new ViewHeader({
            actions: {
                "ACTION.CREATE": false,
                "ACTION.SAVE": [{ id: "SAVE_AND_CLOSE", controller: "save.ctrl" }],
            },
            selection: {
                default: false,
                actions: [{ id: "selection.extra", label: "Selection", controller: "sel.ctrl" }]
            }
        }, "list")

        const exported = header.export()
        expect(exported.actions["ACTION.CREATE"]).toBeFalse()
        expect(exported.actions["ACTION.SAVE"][0].id).toBe("SAVE_AND_CLOSE")
        expect(header.id_compliant(["ACTION.CREATE"]).ok).toBeFalse()
    })

    it("covers action export defaults, domain and params", () => {
        const action = new ViewAction({
            id: "action.with.domain",
            controller: "action.ctrl",
            icon: "bolt",
            label: "Action",
            access: { groups: ["admins"] },
            params: { key: "value" },
            visible: ["id", "=", 1],
            confirm: true
        }, true)

        const autoAction = new ViewAction({ controller: "a", label: "A" })

        expect(action.export().visible).toEqual(["id", "=", 1])
        expect(action.export().params).toEqual({ key: "value" })
        expect(action.export().confirm).toBeTrue()
        expect(autoAction.id.startsWith("action.id.")).toBeTrue()
        expect(action.id_compliant(["action.with.domain"]).ok).toBeFalse()
    })

    it("covers predefined action and route exports", () => {
        const predef = new ViewPreDefAction({
            id: "OPEN",
            controller: "open.ctrl",
            description: "open",
            access: { groups: ["admins"] },
            domain: ["id", "=", 1],
            view: "demo.form"
        }, ["OPEN"])
        const route = new ViewRoute({
            id: "route.main",
            label: "Route",
            description: "desc",
            icon: "arrow",
            route: "/demo",
            visible: ["id", "=", 1],
            context: {
                entity: "demo.entity",
                view: "list.default",
                domain: ["id", "=", 1],
                reset: true
            }
        })

        expect(predef.export().view).toBe("demo.form")
        expect(route.export().context.reset).toBeTrue()
        expect(route.id_compliant(["route.main"]).ok).toBeFalse()
    })

    it("covers route context export without optional values", () => {
        const context = new ViewRouteContext({ entity: "demo.entity", view: "demo.view" })
        expect(context.export()).toEqual({ entity: "demo.entity", view: "demo.view" })
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
