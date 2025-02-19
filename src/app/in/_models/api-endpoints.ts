// api-endpoints.ts
export const API_ENDPOINTS = {
    collectAllClasses: '?get=core_config_classes',

    collectAllPackages: '?get=config_packages',  // URL to collect all the packages

    collectRoutesFromPackage: (packageName: string) =>
        `?get=core_config_routes&package=${packageName}`,  // URL to collect all the routes from a package

    collectAllLiveRoutes: '?get=config_live_routes',  // URL to collect all live routes

    collectControllersFromPackage: (packageName: string) =>
        `?get=core_config_controllers&package=${packageName}`, // URL to collect all the controllers from a package

    collectViewsFromPackage: (packageName: string) =>
        `?get=core_config_views&package=${packageName}`, // URL to collect all the views from a package

    collectMenusFromPackage: (packageName: string) =>
        `?get=core_config_menus&package=${packageName}`, // URL to collect all the menus from a package
};

