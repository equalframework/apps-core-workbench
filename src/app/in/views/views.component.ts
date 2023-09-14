import { Component, OnInit } from '@angular/core';
import { ViewService } from './_services/models.service';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {

  selected_package:string;
  views_for_selected_package:string[];
  selected_view:string;

  constructor(
    private api:ViewService
  ) { }

  ngOnInit(): void {
  }

  public getBack() {}

  public onclickViewSelect(event:string) {}

  public onupdateView(event:any) {}

  public ondeleteView(event:string) {}

  public oncreateView(event:string) {}
}
