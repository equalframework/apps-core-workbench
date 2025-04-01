
export enum Right {
    EQ_R_CREATE = 1,
    EQ_R_READ = 2,
    EQ_R_UPDATE = 4,
    EQ_R_DELETE = 8,
    EQ_R_MANAGE = 16,
    EQ_R_ALL = 31
}

export interface Role{
    description: string,
    rights: Right[],
    implied_by?: string[]
}

export const allEnumKeys = Object.keys(Right).filter(key => isNaN(Number(key)));
export const allEnumValues = Object.values(Right).filter(value => typeof value === 'number') as number[];

export interface Roles{
    [key:string] : Role
}

export interface RoleItem{
   key: string,
   value:Role
}


const RightMapping: Record<string, Right> = {
    'EQ_R_CREATE': Right.EQ_R_CREATE,
    'EQ_R_READ': Right.EQ_R_READ,
    'EQ_R_UPDATE': Right.EQ_R_UPDATE,
    'EQ_R_DELETE': Right.EQ_R_DELETE,
    'EQ_R_MANAGE': Right.EQ_R_MANAGE,
    'EQ_R_WRITE': Right.EQ_R_UPDATE
};

export function convertRights(bitmask: number): Right[] {
    return Object.values(Right).filter((value) =>
        typeof value === 'number' && (bitmask & (value as number)) !== 0
    ) as Right[];
}

export function convertRightsFromStrings(rightsArray: string[]): Right[] {
    return rightsArray.map(right => RightMapping[right]).filter(Boolean);
}
export function getRightName(right: Right): string {
    return Right[right] || `Unknown (${right})`;
}

export interface RolesSend {
    description: string;
    rights: string[];
    implied_by?: string[];
}
export class RoleManager {
    private roles: Roles = {};

    constructor(roles: Roles) {
        this.roles = roles;
        console.log("roles : ", this.roles);
        console.log("roles given : ", roles);
    }

    export(): { [key: string]: RolesSend } {
        let ret: { [key: string]: RolesSend } = {};

        for (const key in this.roles) {
            if (this.roles.hasOwnProperty(key)) {
                const roleDetails = this.roles[key];

                const rightsAsStrings = roleDetails.rights.map(right => Right[right]);

                ret[key] = {
                    description: roleDetails.description,
                    rights: rightsAsStrings,
                    implied_by: roleDetails.implied_by ? [...roleDetails.implied_by] : undefined
                };
            }
        }
        return ret;
    }
}



