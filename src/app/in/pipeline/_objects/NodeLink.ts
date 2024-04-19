import { Node } from "./Node"

export class NodeLink {
    public id: number;
    public from: Node
    public to: Node
    public isSelected: boolean = false;

    constructor(from: Node, to: Node) {
        this.from = from
        this.to = to
    }
}