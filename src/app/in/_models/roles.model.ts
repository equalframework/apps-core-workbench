export interface Role{
    description: string,
    rights: string[],
    implied_by?: string[]
}

export interface Roles{
    [key:string] : Role
}