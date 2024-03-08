import { cloneDeep } from "lodash";
import { ControllerData } from "./ControllerData";

export class ControllerNode {
    public data: ControllerData;
    public position: { x: number, y: number } = { x: 0, y: 0 };
    public updatedPosition: { x: number, y: number } = { x: 0, y: 0 };
    public icon: string;
    public color: string = "whitesmoke";

    constructor(data: ControllerData, position: { x: number, y: number }) {
        this.data = data;
        this.position = position;
        this.updatedPosition = cloneDeep(this.position);
        this.icon = (data.type === "actions") ? "open_in_browser" : "data_array";
    }
}
