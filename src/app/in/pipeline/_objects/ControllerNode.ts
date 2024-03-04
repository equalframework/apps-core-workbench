import { ControllerData } from "./ControllerData";

export class ControllerNode {
    public data: ControllerData;
    public description: string;
    public params: any;
    public response: any;
    public access: any;
    public providers: any;
    public position: { x: number, y: number } = { x: 0, y: 0 };

    constructor(data: ControllerData, description: string, params: any, response: any, access: any, providers: any, position: { x: number, y: number }) {
        this.data = data;
        this.description = description;
        this.params = params;
        this.response = response;
        this.access = access;
        this.providers = providers;
        this.position = position;
    }
}
