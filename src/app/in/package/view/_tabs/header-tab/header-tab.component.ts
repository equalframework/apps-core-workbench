import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { View } from '../../_objects/View';

@Component({
  selector: 'app-header-tab',
  templateUrl: './header-tab.component.html',
  styleUrls: ['./header-tab.component.scss']
})
export class HeaderTabComponent implements OnInit {
  @Input() viewObj: View;
  @Input() groups: string[] = [];
  @Input() actionControllers: string[] = [];
  @Input() entity: string;

  @Output() viewObjChange = new EventEmitter<View>();
  @Output() addFilter = new EventEmitter<void>();
  @Output() deleteFilter = new EventEmitter<number>();

  @ViewChild('headerTabContainer', { read: ElementRef }) headerTabContainer: ElementRef;

  isFilterVisible = false;
  private tabComponentId = 'header';

  constructor(

  ) {}

  ngOnInit(): void {
    // Initialization
  }

  showFilters(): void {
    this.isFilterVisible = true;
  }

  onAddFilter(): void {
    this.viewObj.addFilter();
    this.isFilterVisible = true;
    this.viewObjChange.emit(this.viewObj);
  }

  onDeleteFilter(index: number): void {
    this.viewObj.deleteFilter(index);
    if (this.viewObj.filters.length === 0) {
      this.isFilterVisible = false;
    }
    this.viewObjChange.emit(this.viewObj);
  }

  onFilterChange(): void {
    this.viewObjChange.emit(this.viewObj);
  }
}
