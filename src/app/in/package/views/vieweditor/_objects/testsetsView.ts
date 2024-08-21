// Liste bien remplie mais plutot classique
export var t1 = {
    "name": "Stat Contracts",
    "description": "",
    "controller": "lodging_stats_stat-contracts",
    "header": {
        "actions": {
            "ACTION.CREATE" : false
        }
    },
    "operations": {
        "total": {
            "nb_pers_nights": {
                "operation": "SUM",
                "usage": "number/integer",
                "suffix": " nuitées"
            },
            "price_vati": {
                "operation": "SUM",
                "usage": "amount/money:2"
            }
        }
    },
    "layout": {
        "items": [
            {
                "type": "field",
                "value": "center",
                "width": "15%"
            },
            {
                "type": "field",
                "value": "center_type",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "booking",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "created",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "value": "date_from",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "value": "date_to",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "value": "aamm",
                "width": "8%"
            },
            {
                "type": "field",
                "value": "year",
                "width": "8%"
            },
            {
                "type": "field",
                "value": "rate_class",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "nb_pers",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "nb_nights",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "nb_rental_units",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "nb_pers_nights",
                "width": "18%"
            },
            {
                "type": "field",
                "value": "nb_room_nights",
                "width": "15%"
            },
            {
                "type": "field",
                "value": "customer_name",
                "width": "20%"
            },
            {
                "type": "field",
                "value": "customer_lang",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "customer_zip",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "customer_country",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "price_vate",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "price_vati",
                "width": "20%"
            }
        ]
    }
}

// Liste avec pas mal d'éléments non supportés
export var t2 = {
    "name": "Nights by Age range",
    "description": "",
    "controller": "lodging_stats_stat-nightsagerange",
    "header": {
        "actions": {
            "ACTION.CREATE" : false
        }
    },
    "group_by": [{"field": "age_range", "operation": ["SUM", "object.nb_nights"]}, {"field": "center", "operation": ["SUM", "object.nb_nights"]}],
    "operations": {
        "total": {
            "nb_pers": {
                "operation": "SUM",
                "usage": "numeric/integer",
                "suffix": " pers."
            },
            "nb_nights": {
                "operation": "SUM",
                "usage": "numeric/integer",
                "suffix": " nuitées"
            }
        }
    },
    "layout": {
        "items": [
            {
                "type": "field",
                "value": "age_range",
                "width": "20%"
            },
            {
                "type": "field",
                "value": "center",
                "width": "20%"
            },
            {
                "type": "field",
                "value": "nb_pers",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "nb_nights",
                "width": "10%"
            }
        ]
    }
}

// Très long formulaire sans id aux sections, rows et columns
export var t3 = {
    "name": "Rental Units",
    "description": "A rental unit is a ressource that can be rented to a customer.",
    "access": {
        "groups": ["booking.default.user"]
    },
    "layout": {
        "groups": [
            {
                "sections": [
                    {
                        "label": "General Info",
                        "id": "section.rental_units",
                        "rows": [
                            {
                                "columns": [
                                    {
                                        "width": "50%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "value": "name",
                                                "width": "100%",
                                                "widget": {
                                                    "heading": true
                                                }
                                            },
                                            {
                                                "type": "field",
                                                "value": "code",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Center",
                                                "value": "center_id",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Rentable",
                                                "value": "can_rent",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "type",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Accomodation",
                                                "value": "is_accomodation",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Sojourn Type",
                                                "value": "sojourn_type_id",
                                                "width": "50%"
                                            }
                                        ]
                                    },
                                    {
                                        "width": "50%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "value": "rental_unit_category_id",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "capacity",
                                                "width": "50%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Parent",
                                                "value": "parent_id",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Children",
                                                "value": "has_children",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "label": "Partial rent?",
                                                "value": "can_partial_rent",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "description",
                                                "width": "100%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "status",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "action_required",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "label",
                                                "value": "",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "order",
                                                "width": "33%"
                                            },
                                            {
                                                "type": "field",
                                                "value": "color",
                                                "width": "33%"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "label": "Children",
                        "id": "section.children_section",
                        "visible": ["has_children", "=", true],
                        "rows": [
                            {
                                "columns": [
                                    {
                                        "width": "100%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "value": "children_ids",
                                                "width": "100%"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "label": "Repairs",
                        "id": "section.repairs",
                        "rows": [
                            {
                                "columns": [
                                    {
                                        "width": "100%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "value": "repairs_ids",
                                                "width": "100%",
                                                "widget": {
                                                    "domain": ["type", "=", "ooo"],
                                                    "order": "date",
                                                    "sort": "desc"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

export var t4 = {
    "name": "Service Accounts",
    "description": "Active Service Accounts.",
    "order": "customer_id",
    "sort": "asc",
    "controller": "contractika_serviceaccount_collect",
    "domain": [["sa_type_id", "in", [1,2,3,4,6]],["is_active", "=", true]],
    "header": {
        "actions": {
            "ACTION.CREATE": false
        },
        "selection": {
            "default": false,
            "actions" : [
                {
                    "id": "header.selection.actions.bulk_reports",
                    "label": "Generate Reports",
                    "icon": "edit_note",
                    "controller": "contractika_serviceaccount_bulk-reports"
                }
            ]
        }
    },
    "layout": {
        "items": [
            {
                "type": "field",
                "label": "Id",
                "value": "id",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "name",
                "width": "20%"
            },
            {
                "type": "field",
                "label": "Customer",
                "value": "customer_id",
                "width": "30%",
                "sortable": true
            },
            {
                "type": "field",
                "label": "Contact",
                "value": "contactName",
                "width": "25%"
            },
            {
                "type": "field",
                "value": "created",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "value": "modified",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "label": "Category",
                "value": "sa_category_id",
                "width": "15%",
                "sortable": true
            },
            {
                "type": "field",
                "label": "type",
                "value": "sa_type_id",
                "width": "15%",
                "sortable": true
            },
            {
                "type": "field",
                "value": "startDate",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short",
                    "sortable": true
                }
            },
            {
                "type": "field",
                "value": "endDate",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short",
                    "sortable": true
                }
            },
            {
                "type": "field",
                "value": "is_active",
                "width": "10%",
                "sortable": true
            },
            {
                "type": "field",
                "label": "Reporting",
                "value": "m_reporting",
                "width": "10%",
                "sortable": true
            }
        ]
    }
}

// List avec header selection
export var rt4 = {
    "name": "Service Accounts",
    "description": "Active Service Accounts.",
    "order": "customer_id",
    "sort": "asc",
    "controller": "contractika_serviceaccount_collect",
    "domain": [["sa_type_id", "in", [1,2,3,4,6]],["is_active", "=", true]],
    "header": {
        "actions": {
            "ACTION.CREATE": false
        },
        "selection": {
            "default": false,
            "actions" : [
                {
                    "id": "header.selection.actions.bulk_reports",
                    "label": "Generate Reports",
                    "icon": "edit_note",
                    "controller": "contractika_serviceaccount_bulk-reports"
                }
            ]
        }
    },
    "layout": {
        "items": [
            {
                "type": "field",
                "label": "Id",
                "value": "id",
                "width": "10%"
            },
            {
                "type": "field",
                "value": "name",
                "width": "20%"
            },
            {
                "type": "field",
                "label": "Customer",
                "value": "customer_id",
                "width": "30%",
                "widget": {
                    "sortable": true
                }
            },
            {
                "type": "field",
                "label": "Contact",
                "value": "contactName",
                "width": "25%"
            },
            {
                "type": "field",
                "value": "created",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "value": "modified",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short"
                }
            },
            {
                "type": "field",
                "label": "Category",
                "value": "sa_category_id",
                "width": "15%",
                "widget": {
                    "sortable": true
                }
            },
            {
                "type": "field",
                "label": "type",
                "value": "sa_type_id",
                "width": "15%",
                "widget": {
                    "sortable": true
                }
            },
            {
                "type": "field",
                "value": "startDate",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short",
                    "sortable": true
                }
            },
            {
                "type": "field",
                "value": "endDate",
                "width": "15%",
                "widget": {
                    "usage": "datetime/short",
                    "sortable": true
                }
            },
            {
                "type": "field",
                "value": "is_active",
                "width": "10%",
                "widget": {
                    "sortable": true
                }
            },
            {
                "type": "field",
                "label": "Reporting",
                "value": "m_reporting",
                "width": "10%",
                "widget": {
                    "sortable": true
                }
            }
        ]
    }
}

export var t5 = {
    "name": "Cashdesk Log",
    "description": "",
    "access": {
        "groups": ["pos.default.user"]
    },
    "layout": {
        "groups": [
            {
                "sections": [
                    {
                        "rows": [
                            {
                                "columns": [
                                    {
                                        "width": "50%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "value": "created",
                                                "width": "50%",
                                                "widget": {
                                                    "readonly": true,
                                                    "heading": true
                                                }
                                            },
                                            {
                                                "type": "field",
                                                "value": "amount",
                                                "width": "50%",
                                                "widget": {
                                                    "heading": true
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "width": "25%",
                                        "items": []
                                    },
                                    {
                                        "width": "25%",
                                        "items": [
                                            {
                                                "type": "field",
                                                "label": "User",
                                                "value": "user_id",
                                                "width": "100%",
                                                "widget": {
                                                    "domain": ["id", "=", "user.id"]
                                                }
                                            },
                                            {
                                                "type": "field",
                                                "label": "Cashdesk",
                                                "value": "cashdesk_id",
                                                "width": "100%",
                                                "widget": {
                                                    "domain": ["center_id", "in", "user.centers_ids"]
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}