import { Node } from "./Node";
import { NodeLink } from "./NodeLink";

export class Parameter {
    public id: number;
    public node: Node;
    public param: string;
    public value: any;

    constructor(param: string, value: any) {
        this.param = param;
        this.value = value;
    }
}