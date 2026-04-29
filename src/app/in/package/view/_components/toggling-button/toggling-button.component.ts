import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toggling-button',
  templateUrl: './toggling-button.component.html',
  styleUrls: ['./toggling-button.component.scss']
})
export class TogglingButtonComponent implements OnInit {

  @Input() baseState = true;
  @Input() enabledIcon = '';
  @Input() disabledIcon = '';
  @Input() disabled = false;
  @Output() toggle = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleIt(): void {
    this.baseState = !this.baseState;
    this.toggle.emit(this.baseState);
  }

}
