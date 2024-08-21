import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EqualComponentDescriptor } from 'src/app/in/_models/equal-component-descriptor.class';

@Component({
  selector: 'info-menu',
  templateUrl: './info-menu.component.html',
  styleUrls: ['./info-menu.component.scss']
})
export class InfoMenuComponent implements OnInit {

    @Input() menu: EqualComponentDescriptor;
    @Input() selected_package: string;

    constructor(
            private router: Router
        ) { }

    public ngOnInit(): void {
    }

    public onclickTranslations() {
        this.router.navigate(['/package/'+this.selected_package+'/menu/'+this.menu.name+'/translations']);
    }

    public onclickEdit() {
        this.router.navigate(['/package/'+this.selected_package+'/menu/'+this.menu.name]);
    }


}
