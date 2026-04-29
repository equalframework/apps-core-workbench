import { cloneDeep } from 'lodash';

export class WorkflowNode {
    public name: string;
    public description = '';
    public icon = 'hub';
    public help = '';

    public position: {x: number, y: number} = {x : 0, y : 0};
    private initialPosition: {x: number, y: number} = {x : 0, y : 0};
    public width = 200;
    public height = 63;

    get initialPos(): {x: number, y: number} {
        return this.initialPosition;
    }

    constructor(name: string, args: {position?: {x: number, y: number}, description?: string, help?: string, icon?: string} = {} ) {
        this.name = name;
        if (args.position) {
            this.position = args.position;
            this.initialPosition = cloneDeep(args.position);
        }
        if (args.description) {
            this.description = args.description;
        }
        if (args.help) {
            this.help = args.help;
        }
        if (args.icon) {
            this.icon = args.icon;
        }
    }

    export(): any {
        const ret: any =  {};
        if (this.description){
            ret.description = this.description;
        }
        if (this.help){
            ret.help = this.help;
        }
        if (this.icon){
            ret.icon = this.icon;
        }
        return ret;
    }

    generateMetaData(): any {
        return {
            position : this.position
        };
    }
}
