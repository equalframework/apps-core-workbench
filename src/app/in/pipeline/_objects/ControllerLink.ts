import { ControllerNode } from "./ControllerNode"

export enum Anchor {
    Right, Left
}

export class ControllerLink {
    public from: ControllerNode
    public to: ControllerNode

    constructor(from: ControllerNode, to: ControllerNode) {
        this.from = from
        this.to = to
    }
}