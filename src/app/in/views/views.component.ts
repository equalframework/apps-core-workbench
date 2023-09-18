import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ViewService } from './_services/view.service';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss'],
  encapsulation : ViewEncapsulation.Emulated
})
export class ViewsComponent implements OnInit {

  selected_package:string;
  views_for_selected_package:string[];
  selected_view:string;

  constructor(
    private api:ViewService,
    private activatedRoute:ActivatedRoute,
    private router:Router
  ) { }

  async ngOnInit() {
    const type = this.activatedRoute.snapshot.paramMap.get('type')
    const entity = this.activatedRoute.snapshot.paramMap.get('entity')
    if(type && entity)
      this.views_for_selected_package = await this.api.getViews(type,entity)
  }

  public getBack() {
    this.router.navigate(['..'])
  }

  public onclickViewSelect(event:string) {
    this.selected_view = event
  }

  public onupdateView(event:any) {}

  public ondeleteView(event:string) {}

  public oncreateView(event:string) {}
}
