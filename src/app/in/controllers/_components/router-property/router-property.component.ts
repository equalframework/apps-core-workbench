import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-router-property',
    templateUrl: './router-property.component.html',
    styleUrls: ['./router-property.component.scss'],
    encapsulation : ViewEncapsulation.Emulated
})
export class RouterPropertyComponent implements OnInit {

    @Input() selected_property: any;
    @Input() schema: any;
    @Input() eq_package: any;
    @Input() controller_name: any;
    @Input() selected_type_controller: any;

    constructor() { }

    ngOnInit(): void {
    }
}
