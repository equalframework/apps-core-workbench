import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-groups-viewer',
  templateUrl: './groups-viewer.component.html',
  styleUrls: ['./groups-viewer.component.scss']
})
export class GroupsViewerComponent implements OnInit {
  @Input() groups_scheme:any;

  obk = Object.keys


  constructor() { }

  ngOnInit(): void {
  }

}
