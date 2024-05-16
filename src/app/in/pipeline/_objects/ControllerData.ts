export class ControllerData {
    public fullName: string;
    public type: string;
    public pack: string;
    public name: string;
    public apiUrl: string;

    constructor(fullName: string, type: string, pack: string, name: string, apiUrl: string) {
        this.fullName = fullName;
        this.type = type;
        this.pack = pack;
        this.name = name;
        this.apiUrl = apiUrl;
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