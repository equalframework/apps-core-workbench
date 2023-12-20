import { cloneDeep } from "lodash";
import { WorkflowNode } from "./WorkflowNode";

export enum Anchor {
    TopLeft,Top,TopRight,MiddleLeft,MiddleRight,BottomLeft,Bottom,BottomRight
}

export class WorkflowLink {
    public from:WorkflowNode
    public to:WorkflowNode
    public anchorFrom:Anchor = Anchor.Top
    public anchorTo:Anchor = Anchor.Bottom

    public name:string = "transition"
    public watch:string[] = []
    public description:string = ""
    public help:string = ""
    public domain:any[] = []
    public policies:string[] = []
    onafter:string = ""

    leftover:any = {}

    get status():string {
        return this.to.name
    }

    

    constructor(from:WorkflowNode,to:WorkflowNode,anchorFrom:Anchor,anchorTo:Anchor,scheme:any = {}) {
        this.from = from
        this.to = to
        this.anchorFrom = anchorFrom
        this.anchorTo = anchorTo


        if(scheme.name) {
            this.name = scheme.name
            delete scheme.name
        }
        if(scheme.watch) {
            this.watch = scheme.watch
            delete scheme.watch
        }
        if(scheme.description) {
            this.description = scheme.description
            delete scheme.description
        }
        if(scheme.help) {
            this.help = scheme.help
            delete scheme.help
        }
        if(scheme.onafter) {
            this.onafter = scheme.onafter
            delete scheme.onafter
        }
        if(scheme.policies) {
            this.policies = scheme.policies
            delete scheme.policies
        }
        if(scheme.domain) {
            this.domain = scheme.domain
            delete scheme.domain
        }
        delete scheme.status
    }
    
    export() {
        let ret:any = {}
        for(let key in this.leftover) {
            if(this.leftover[key]) {
                try {
                    if(this.leftover[key].length > 0) {
                        continue
                    }
                } catch {}
                ret[key] = this.leftover[key]
            }
        }
        if(this.description) {
            ret.description = this.description
        }
        if(this.help) {
            ret.help = this.help
        }
        if(this.watch.length > 0) {
            ret.watch = this.watch
        }
        if(this.onafter) {
            ret.onafter = this.onafter
        }
        if(this.policies.length > 0) {
            ret.policies = this.policies
        }
        if(this.domain.length > 0) {
            ret.domain = this.domain
        }
        if(this.status) {
            ret.status = this.status
        }
        return ret
    }

    generateMetaData() {
        return {
            anchorFrom : this.anchorFrom,
            anchorTo : this.anchorTo,
        }
    }
}

export const test:{[id:string]:any} = {"created":{"description":"The user account has been created but is not validated yet.","transitions":{"validation":{"watch":["validated"],"domain":["validated","=",true],"description":"Update the user status based on the `validated` field.","help":"The `validated` field is set by a dedicated controller that handles email confirmation requests.","status":"validated","onafter":"onafterValidate"}}},"validated":{"description":"The email address of the account has been confirmed.","transitions":{"suspension":{"description":"Set the user status as suspended.","status":"suspended"},"confirmation":{"domain":["validated","=",true],"description":"Update the user status based on the `confirmed` field.","help":"The `confirmed` field is set by a dedicated controller that handles the account confirmation process (auto or manual).","status":"confirmed"}}},"confirmed":{"description":"The account has been validated by the USER_ACCOUNT_VALIDATION policy, and the email address has been confirmed.","transitions":{"suspension":{"description":"Set the user account as disabled (prevents signin).","status":"suspended"}}},"suspended":{"transitions":{"confirmation":{"description":"Re-enable the user account.","status":"confirmed"}}}}
