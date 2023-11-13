export class WorkflowNode {
    public name:string
    public type:string
    public position:{x:number,y:number} = {x : 0, y : 0}
    public width:number = 0
    public height:number = 0
    public fromPosition:"top"|"left"|"bottom"|"right"|"center" = "center"
    public toPosition:"top"|"left"|"bottom"|"right"|"center" = "center"

    constructor(name:string,args:any = {}) {
        this.name = name
        if(args["fromPosition"]) {
            this.fromPosition = args["fromPosition"]
        }
        if(args["toPosition"]) {
            this.toPosition = args["toPosition"]
        }
    }
}