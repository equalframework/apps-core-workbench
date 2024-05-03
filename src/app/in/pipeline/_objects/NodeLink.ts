import { Node } from "./Node"

export class NodeLink {
    public id: number;

    public reference: Node;
    public source: Node;
    public target: Node;

    public target_param: string;
    public isSelected: boolean = false;

    constructor(reference: Node, source: Node, target: Node) {
        this.reference = reference;
        this.source = source;
        this.target = target;
    }
}