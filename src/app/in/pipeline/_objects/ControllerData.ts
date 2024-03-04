export class ControllerData {
    public type: string;
    public package: string;
    public name: string;
    public url: string;

    constructor(type: string, pack: string, name: string, url: string) {
        this.type = type;
        this.package = pack;
        this.name = name;
        this.url = url;
    }
}