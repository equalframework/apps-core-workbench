import { Node } from "./Node";
import { NodeLink } from "./NodeLink";

export class Parameter {
    public node: Node;
    public link: NodeLink;
    public source: string;
    public target: string;

    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
    }
}