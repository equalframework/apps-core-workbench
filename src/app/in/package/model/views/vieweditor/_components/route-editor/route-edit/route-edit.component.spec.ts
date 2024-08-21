import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteEditComponent } from './route-edit.component';
import { SharedLibModule } from 'sb-shared-lib';
import { ViewRoute } from '../../../_objects/View';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RouteEditComponent', () => {
  let component: RouteEditComponent;
  let fixture: ComponentFixture<RouteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedLibModule, BrowserAnimationsModule],
      declarations: [ RouteEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteEditComponent);
    component = fixture.componentInstance;
    component.route = new ViewRoute()
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
