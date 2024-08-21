export class EqualComponentDescriptor {
    // index signature
    [key: string]: any;

    constructor(
            public package_name: string = '',
            public name: string = '',
            public type: string = '',
            public file: string = '',
            public item: any = {}
        ) {}
}
