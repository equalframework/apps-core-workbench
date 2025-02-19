export const API_ENDPOINTS = {
    // Package-specific actions
    package: {
        collect_all: '?get=config_packages',
        create: (package_name: string) =>
            `?do=core_config_create-package&package=${package_name}`,
        delete: (package_name: string) =>
            `?do=core_config_delete-package&package=${package_name}`
    },

    // Class-specific actions
    class: {
        collect_all: '?get=core_config_classes',
        create: (package_name: string, class_name: string, parent: string) =>
`?do=core_config_create-model&model=${class_name}&package=${package_name}${parent !== "equal\\orm\\Model" ? `&extends=${parent.replace(/\\/g, '\\\\')}` : ""}`,
        update_fields: (new_schema: {}, package_name: string, class_name: string) =>
            `?do=config_update-model&part=class&entity=${package_name}\\${class_name}&payload=${JSON.stringify(new_schema)}`,
        delete: (package_name: string, class_name: string) =>
            `?do=core_config_delete-model&package=${package_name}&model=${class_name}`
    },

    // View-specific actions
    view: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_views&package=${package_name}`,
        create: (package_name: string, model_name: string, view_name: string) =>
            `?do=core_config_create-view&view_id=${view_name}&entity=${package_name}\\${model_name}`,
        delete: (package_name: string, model_name: string, view_name: string) =>
            `?do=core_config_delete-view&entity=${package_name}\\${model_name}&view_id=${view_name}`
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
            `?do=core_config_delete-view&entity=${package_name}\\menu&view_id=${name}`
    },

    // Route-specific actions
    route: {
        collect_from_package: (package_name: string) =>
            `?get=core_config_routes&package=${package_name}`,
        collect_all_live: '?get=config_live_routes',
        create: (package_name: string, route_name: string) =>
            `?do=core_config_create-route&package=${package_name}&route_name=${route_name}`,
        delete: (package_name: string, route_name: string) =>
            `?do=core_config_delete-route&package=${package_name}&route_name=${route_name}`
    }
};
