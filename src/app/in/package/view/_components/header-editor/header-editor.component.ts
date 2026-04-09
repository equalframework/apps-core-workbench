import { Component, Input, OnInit } from '@angular/core';
import { ViewHeader } from '../../_objects/View';

@Component({
  selector: 'app-header-editor',
  templateUrl: './header-editor.component.html',
  styleUrls: ['./header-editor.component.scss']
})
export class HeaderEditorComponent implements OnInit {

  @Input() obj: ViewHeader;
  @Input() type: string;
  @Input() groups: string[];
  @Input() actionControllers: string[];
  @Input() entity: string;

  headerActionVisible = false;
  headerSelectionActionVisible = false;

  obk = Object.keys;

  constructor() { }

  ngOnInit(): void {
    this.updateSelectionActionVisibility();
  }

  ngOnChanges(): void {
    this.updateSelectionActionVisibility();
  }

  private updateSelectionActionVisibility(): void {
    if (this.obj.selection.predef_actions._has_selection_actions) {
      this.headerSelectionActionVisible = true;
    }
    if (this.obj._has_actions) {
      this.headerActionVisible = true;
    }
  }
}
