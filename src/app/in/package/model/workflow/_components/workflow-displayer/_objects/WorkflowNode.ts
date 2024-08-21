import { cloneDeep } from "lodash"

export class WorkflowNode {
    public name:string
    public description:string = ""
    public icon:string = "hub"
    public help:string = ""

    public position:{x:number,y:number} = {x : 0, y : 0}
    private initialPosition:{x:number,y:number} = {x:0,y:0}
    public width:number = 200
    public height:number = 63

    get initialPos() {
        return this.initialPosition
    }

    constructor(name:string,args:{position?:{x:number,y:number}, description?:string, help?:string, icon?:string} = {} ) {
        this.name = name
        if(args.position) {
            this.position = args.position
            this.initialPosition = cloneDeep(args.position)
        }
        if(args.description) {
            this.description = args.description
        }
        if(args.help) {
            this.help = args.help
        }
        if(args.icon) {
            this.icon = args.icon
        }
    }

    export() {
        let ret:any =  {}
        if(this.description){
            ret.description = this.description
        }
        if(this.help){
            ret.help = this.help
        }
        if(this.icon){
            ret.icon = this.icon
        }
        return ret
    }

    generateMetaData() {
        return {
            position : this.position
        }
    }
}