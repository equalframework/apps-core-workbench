import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-info',
  templateUrl: './menu-info.component.html',
  styleUrls: ['./menu-info.component.scss']
})
export class MenuInfoComponent implements OnInit {

  @Input() menu_name:string = ""
  @Input() package:string = ""


  constructor() { }

  ngOnInit(): void {
  }

}
