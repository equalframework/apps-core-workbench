
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

export function convertRights(rightsValue: number): Right[] {
    return Object.keys(Right)
        .filter(key => isNaN(Number(key)))
        .map(key => Right[key as keyof typeof Right])
        .filter(value => value !== Right.EQ_R_ALL && (rightsValue & value) !== 0);
}

export function getRightName(right: Right): string {
    return Right[right] || `Unknown (${right})`;
}




