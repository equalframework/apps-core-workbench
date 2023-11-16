export class WorkflowNode {
    public name:string
    public description:string = ""

    public position:{x:number,y:number} = {x : 0, y : 0}
    public width:number = 200
    public height:number = 63

    constructor(name:string,args:any = {}) {
        this.name = name
        if(args.position)
            this.position = args.position
    }
}