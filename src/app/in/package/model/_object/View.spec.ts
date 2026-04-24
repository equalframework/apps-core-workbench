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