import { ValidationStatusInfo } from "../../_services/json-validation.service";

export class Route {
    methods: string[] = [];
    isLive = false;
    validationStatus: ValidationStatusInfo[] = [];
    routeMeta: { icon: string, tooltip: string, value: string, copyable?: boolean, double_backslash?: boolean }[] = [];
    package_name: string = '';
    name: string = '';
    type: string = '';
    file: string = '';
    item: any = {};
    description?: string = '';

    constructor(data: any) {
        Object.assign(this, data);
    }

    public getSchema(): any {
        return {
            [this.name]: this.item
        };
    }
}