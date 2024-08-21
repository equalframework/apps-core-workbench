import { Component, Input, OnInit } from '@angular/core';
import { ViewHeader } from '../../_objects/View';

@Component({
  selector: 'app-header-editor',
  templateUrl: './header-editor.component.html',
  styleUrls: ['./header-editor.component.scss']
})
export class HeaderEditorComponent implements OnInit {

  @Input() obj:ViewHeader
  @Input() type:string
  @Input() groups:string[]
  @Input() action_controllers:string[]
  @Input() entity:string
  
  header_action_visible:boolean = false
  header_selection_action_visible:boolean = false

  obk = Object.keys

  constructor() { }

  ngOnInit(): void {
  }

}
