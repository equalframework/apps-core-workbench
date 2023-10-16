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