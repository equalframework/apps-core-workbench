import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewAction } from '../../_objects/View';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-action-editor',
  templateUrl: './action-editor.component.html',
  styleUrls: ['./action-editor.component.scss']
})
export class ActionEditorComponent implements OnInit {

  @Input() obj:ViewAction
  @Input() controllers:string[]
  @Output() delete = new EventEmitter<void>()

  filteredOptions: string[]

  constructor() { }

  ngOnInit(): void {
    this.filteredOptions = ['',...this.controllers]
    
  }

  tap(new_value:string) {
    this.obj.controller = new_value
    this.filteredOptions = ['',...this.controllers.filter((val) => (val.toLowerCase().includes(this.obj.controller)))]
    this.filteredOptions.push('')
  }


}
