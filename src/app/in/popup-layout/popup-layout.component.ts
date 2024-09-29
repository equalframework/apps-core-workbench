import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-popup-layout',
    templateUrl: './popup-layout.component.html',
    styleUrls: ['./popup-layout.component.scss']
})
export class PopupLayoutComponent implements OnInit {

    @Input() closeButton:boolean = true;
    @Input() okButton:boolean = false;
    @Input() okButtonText:string = "ok";
    @Input() okButtonDisabled:boolean = false;

    @Output() close = new EventEmitter<void>();
    @Output() ok = new EventEmitter<void>();

    constructor() { }

    ngOnInit(): void {
    }

}
