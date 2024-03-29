import { Node } from "./Node"

export class NodeLink {
    public from: Node
    public to: Node
    public isSelected: boolean = false;

    constructor(from: Node, to: Node) {
        this.from = from
        this.to = to
    }
}