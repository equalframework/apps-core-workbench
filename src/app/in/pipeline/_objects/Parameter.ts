import { Node } from "./Node";

export class Parameter {
    public id: number;
    public node: Node;
    public param: string;
    public value: any;

    constructor(node: Node, param: string, value: any) {
        this.node = node;
        this.param = param;
        this.value = value;
    }
}