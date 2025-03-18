
export class EqualComponentDescriptor{
    // Index signature
    [key: string]: any;

    constructor(
        public package_name: string = '',
        public name: string = '',
        public type: string = '',
        public file: string = '',
        public item: any = {}
    ) {}

    public isEqualTo?(other: EqualComponentDescriptor | undefined): boolean {
        return other !== undefined &&
               this.package_name === other.package_name &&
               this.name === other.name &&
               this.type === other.type;
    }
}
