import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-inner-header',
  templateUrl: './inner-header.component.html',
  styleUrls: ['./inner-header.component.scss']
})
export class InnerHeaderComponent implements OnInit {

    @Input() customButtonList:{name:string, icon:string, disabled:false}[] = []

    @Input() contextualButton:{name:string, icon:string, disabled:false}[] = []

    // Buttons display
    @Input() buttonBack:boolean = false
    @Input() buttonCancelOne:boolean = false
    @Input() buttonRevertOne:boolean = false
    @Input() buttonSave:boolean = false
    @Input() buttonLoad:boolean = false
    @Input() buttonNew:boolean = false
    @Input() buttonRun:boolean = false
    @Input() buttonCancel:boolean = false
    @Input() customButton:boolean = false
    @Input() buttonSaveAs:boolean =false
    // Button Disable
    @Input() buttonBackDisabled:boolean = false
    @Input() buttonCancelOneDisabled:boolean = false
    @Input() buttonRevertOneDisabled:boolean = false
    @Input() buttonSaveDisabled:boolean = false
    @Input() buttonRunDisabled: boolean = false
    @Input() buttonLoadDisabled:boolean = false
    @Input() buttonNewDisabled:boolean = false
    @Input() buttonCancelDisabled:boolean = false
    @Input() buttonSaveAsDisabled:boolean = false;

    // Button Actions
    @Output() onButtonBack = new EventEmitter<void>()
    @Output() onButtonCancelOne = new EventEmitter<void>()
    @Output() onButtonRevertOne = new EventEmitter<void>()
    @Output() onButtonSave = new EventEmitter<void>()
    @Output() onButtonRun = new EventEmitter<void>()
    @Output() onButtonLoad = new EventEmitter<void>()
    @Output() onButtonNew = new EventEmitter<void>()
    @Output() onButtonCancel = new EventEmitter<void>()
    @Output() onCustomButton = new EventEmitter<string>()
    @Output() onContextualButton = new EventEmitter<string>()
    @Output() onButtonSaveAs = new EventEmitter<void>();
    constructor() { }

    ngOnInit(): void {
    }

}
