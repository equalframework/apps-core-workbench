import { WorkflowNode } from "./WorkflowNode";

export enum Anchor {
    TopLeft,Top,TopRight,MiddleLeft,MiddleRight,BottomLeft,Bottom,BottomRight
}

export class WorkflowLink {
    public from:WorkflowNode
    public to:WorkflowNode
    public type:string = ""
    public anchorFrom:Anchor = Anchor.Top
    public anchorTo:Anchor = Anchor.Bottom

    constructor(type:string,from:WorkflowNode,to:WorkflowNode,anchorFrom:Anchor,anchorTo:Anchor) {
        this.type = type
        this.from = from
        this.to = to
        this.anchorFrom = anchorFrom
        this.anchorTo = anchorTo
    }
}