import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteEditComponent } from './route-edit.component';
import { SharedLibModule } from 'sb-shared-lib';

describe('RouteEditComponent', () => {
  let component: RouteEditComponent;
  let fixture: ComponentFixture<RouteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedLibModule],
      declarations: [ RouteEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
