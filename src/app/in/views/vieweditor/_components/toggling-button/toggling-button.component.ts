import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggling-button',
  templateUrl: './toggling-button.component.html',
  styleUrls: ['./toggling-button.component.scss']
})
export class TogglingButtonComponent implements OnInit {

  @Input() baseState:boolean = true
  @Input() on_icon:string = ""
  @Input() off_icon:string = ""
  @Input() disabled:boolean = false
  @Output() toggle = new EventEmitter<boolean>()

  constructor() { }

  ngOnInit(): void {
  }

  toggleIt() {
    this.baseState = !this.baseState
    this.toggle.emit(this.baseState)
  }

}
