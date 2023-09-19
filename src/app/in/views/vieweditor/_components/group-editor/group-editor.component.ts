import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewGroup, ViewSection } from '../../_objects/View';

@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html',
  styleUrls: ['./group-editor.component.scss']
})
export class GroupEditorComponent implements OnInit {

  selected_id:string
  @Input() group_obj:ViewSection[]
  @Output() onChange = new EventEmitter<ViewSection[]>()

  constructor() { }

  ngOnInit(): void {
  }

}
