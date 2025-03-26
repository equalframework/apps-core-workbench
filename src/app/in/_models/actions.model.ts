export interface Action {
    description:string;
    policies:string[];
    function:string;
}

export interface Actions {
    [key:string]:Action;
}

export interface ActionItem {
    key:string,
    value:Action
}