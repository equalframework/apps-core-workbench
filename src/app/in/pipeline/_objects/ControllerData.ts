export class ControllerData {
    public fullName: string;
    public type: string;
    public package: string;
    public name: string;
    public url: string;

    constructor(fullName: string, type: string, pack: string, name: string, url: string) {
        this.fullName = fullName;
        this.type = type;
        this.package = pack;
        this.name = name;
        this.url = url;
    }

    public description: string;
    public params: { [key: string]: Param };
    public response: Response;
}

class Param {
    description: string;
    type: string;
    usage?: string;
    default?: any;
    required?: boolean;
    min?: number;
    max?: number;
    foreign_object?: string;
    visible?: any[];
}

class Response {
    'content-type': string;
    charset: string;
    'accept-origin': string[];
    schema: {
        type: string;
        usage?: string;
        qty: string;
    };
}