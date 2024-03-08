export class ControllerData {
    public type: string;
    public package: string;
    public name: string;
    public url: string;

    public description: string;
    public params: any;
    public response: any;
    public access: any;
    public providers: any;

    constructor(type: string, pack: string, name: string, url: string) {
        this.type = type;
        this.package = pack;
        this.name = name;
        this.url = url;
    }
}