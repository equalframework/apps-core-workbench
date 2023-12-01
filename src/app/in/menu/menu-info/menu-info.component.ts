import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-menu-info',
  templateUrl: './menu-info.component.html',
  styleUrls: ['./menu-info.component.scss']
})
export class MenuInfoComponent implements OnInit {

  @Input() menu_name:string = ""
  @Input() package:string = ""

  @Output() navigate = new EventEmitter<number>();


  constructor() { }

  ngOnInit(): void {
  }

}
