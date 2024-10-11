import { UmlErdNode } from './UmlErdNode';

export enum Anchor {
    TopLeft,Top,TopRight,MiddleLeft,MiddleRight,BottomLeft,Bottom,BottomRight
}

export class UmlErdLink {
    public from:UmlErdNode;
    public to:UmlErdNode;

    public attribute_number_from:number = -1;
    public attribute_number_to:number  = -1;

    public relType:"many2many"|"one2many"|"many2one"|"extends" = "many2many"

    public leftover:any = {};

    public get status(): string {
        return this.to.entity
    }

    constructor(from:UmlErdNode, to:UmlErdNode, field:string, f_field:string, reltype:"many2many"|"one2many"|"many2one"|"extends") {
        this.from = from;
        this.to = to;
        this.attribute_number_from = this.from.getFieldIndex(field);
        this.attribute_number_to = this.to.getFieldIndex(f_field);
        this.relType = reltype;
    }

    public export() {
    }

    public generateMetaData() {
    }
}

export const test:{[id:string]:any} = {"created":{"description":"The user account has been created but is not validated yet.","transitions":{"validation":{"watch":["validated"],"domain":["validated","=",true],"description":"Update the user status based on the `validated` field.","help":"The `validated` field is set by a dedicated controller that handles email confirmation requests.","status":"validated","onafter":"onafterValidate"}}},"validated":{"description":"The email address of the account has been confirmed.","transitions":{"suspension":{"description":"Set the user status as suspended.","status":"suspended"},"confirmation":{"domain":["validated","=",true],"description":"Update the user status based on the `confirmed` field.","help":"The `confirmed` field is set by a dedicated controller that handles the account confirmation process (auto or manual).","status":"confirmed"}}},"confirmed":{"description":"The account has been validated by the USER_ACCOUNT_VALIDATION policy, and the email address has been confirmed.","transitions":{"suspension":{"description":"Set the user account as disabled (prevents signin).","status":"suspended"}}},"suspended":{"transitions":{"confirmation":{"description":"Re-enable the user account.","status":"confirmed"}}}}
