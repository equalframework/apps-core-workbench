export const API_ENDPOINTS = {
    // Package-specific actions
    package: {
        collect_all: '?get=config_packages',
        create: (package_name: string) =>
            `?do=core_config_create-package&package=${package_name}`,
        delete: (package_name: string) =>
            `?do=core_config_delete-package&package=${package_name}`,
        infos: (package_name:string) =>
            `?get=packageinfo&package=${package_name}`
    },

    // Class-specific actions
    class: {
        collect_all: '?get=core_config_classes',
        create: (package_name: string, class_name: string, parent: string) =>
            `?do=core_config_create-model&model=${class_name}&package=${package_name}${parent !== "equal\\orm\\Model" ? `&extends=${parent.replace(/\\/g, '\\\\')}` : ""}`,
        update_fields: (new_schema: {}, package_name: string, class_name: string) =>
            `?do=config_update-model&part=class&entity=${package_name}\\${class_name}&payload=${JSON.stringify(new_schema)}`,
        delete: (package_name: string, class_name: string) =>
            `?do=core_config_delete-model&package=${package_name}&model=${class_name}`,
        policies: {
            get: (package_name : string, class_name: string) =>
                `?get=core_model_policies&entity=${package_name}\\${class_name}`,
        },
        actions: {
            get: (package_name : string, class_name: string) =>
                `?get=core_model_actions&entity=${package_name}\\${class_name}`,
            save: (package_name:string, class_name:string) =>
                `?do=core_config_update-actions&entity=${package_name}\\${class_name}`,

        },
        roles: {
            get: (package_name : string, class_name: string) =>
                `?get=core_model_roles&entity=${package_name}\\${class_name}`,
        }
    },

    // View-specific actions
    view: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_views&package=${package_name}`,
        create: (package_name: string, model_name: string, view_name: string) =>
            `?do=core_config_create-view&view_id=${view_name}&entity=${package_name}\\${model_name}`,
        delete: (package_name: string, model_name: string, view_name: string) =>
            `?do=core_config_delete-view&entity=${package_name}\\${model_name}&view_id=${view_name}`,
        read: (package_name: string, model_name: string, view_name: string) =>
            `?get=core_model_view&view_id=${view_name}&entity=${package_name}\\${model_name}`,
        save: (payload: any, package_name: string, model: string, view_id: string) =>
            `?do=core_config_update-view&entity=${package_name}\\${model}&view_id=${view_id}&payload=${JSON.stringify(payload)}`
    },

    // Controller-specific actions
    controller: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_controllers&package=${package_name}`,
        create: (package_name: string, controller_name: string, controller_type: string) =>
            `?do=core_config_create-controller&controller_name=${controller_name}&controller_type=${controller_type}&package=${package_name}`,
        update: (controller_name: string, controller_type: string, payload: { [id: string]: any }) =>
            `?do=core_config_update-controller&controller=${controller_name}&operation=${controller_type}&payload=${JSON.stringify(payload)}`,
        delete: (package_name: string, controller_name: string, controller_type: string) =>
            `?do=core_config_delete-controller&package=${package_name}&controller_name=${controller_name}&controller_type=${controller_type}`
    },

    // Menu-specific actions
    menu: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_menus&package=${package_name}`,
        create: (package_name: string, name: string, type: string) =>
            `?do=core_config_create-view&view_id=${name}.${type}&entity=${package_name}\\menu`,
        delete: (package_name: string, name: string) =>
            `?do=core_config_delete-view&entity=${package_name}\\menu&view_id=${name}`,
        read: (package_name: string, name: string) =>
            `?get=core_model_menu&package=${package_name}&menu_id=${name}`
    },

    // Route-specific actions
    route: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_routes&package=${package_name}`,
        collect_all_live: '?get=config_live_routes',
        create: (package_name: string, file_name: string, url_route: string) =>
            `?do=core_config_create-route&package=${package_name}&file=${file_name}&url=${url_route}`
    },

    // Workflow-specific actions
    workflow: {
        get: (package_name: string, model: string) =>
            `?get=core_model_workflow&entity=${package_name}\\${model}`,
        save: (package_name: string, model: string) =>
            `?do=core_config_update-workflow&entity=${package_name}\\${model}`,
        create: (package_name: string, model: string) =>
            `?do=core_config_create-workflow&entity=${package_name}\\${model}`
    },

    // Metadata-specific actions
    metadata: {
        collect: (code: string, reference: string) =>
            `?get=core_model_collect&entity=core\\Meta&fields=[value]&domain=[[code,=,${code}],[reference,=,${reference}]]`,
        create: (code: string, reference: string, payload: string) =>
            `?do=core_model_create&entity=core\\Meta&fields={"value": "${payload}", "code": "${code}", "reference": "${reference}"}`,
        save: (id: number, payload: string) =>
            `?do=core_model_update&entity=core\\Meta&id=${id}&fields={"value": "${payload}"}`
    },

    // Schema-specific actions
    schema: {
        get: (entity: string) =>
            `?get=core_model_schema&entity=${entity}`
    }
};
