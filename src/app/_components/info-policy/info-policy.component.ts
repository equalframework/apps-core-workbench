import { Component, Input, OnInit } from '@angular/core';
import { PolicyItem } from 'src/app/in/_models/policy.model';

@Component({
  selector: 'app-info-policy',
  templateUrl: './info-policy.component.html',
  styleUrls: ['./info-policy.component.scss']
})
export class InfoPolicyComponent implements OnInit {

    @Input() policy:PolicyItem
  constructor() { }

  ngOnInit(): void {
  }

}
