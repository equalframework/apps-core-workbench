import { Node } from "./Node";
import { NodeLink } from "./NodeLink";

export class Parameter {
    public id: number;
    public node: Node;
    public link: NodeLink;
    public source: any;
    public target: string;

    constructor(source: any, target: string) {
        this.source = source;
        this.target = target;
    }
}