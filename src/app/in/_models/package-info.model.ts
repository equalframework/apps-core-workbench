export interface PackageInfos {
    name: string;
    description: string;
    version: string;
    authors: string[];
    depends_on: string[];
    requires: Record<string, string>;
    apps: App[];
  }

  interface App {
    id: string;
    name: string;
    extends: string;
    description: string;
    icon: string;
    color: string;
    access: {
      groups: string[];
    };
    params: {
      menus: Record<string, string>;
      context: Record<string, string>;
    };
  }

  export type PackageSummary = Pick<PackageInfos, "description" | "version" | "authors" | "depends_on"> & {
    appName: string;
    appIcon: string;
    appDescription: string;
  };
