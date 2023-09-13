import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsInfoComponent } from './views-info.component';

describe('ViewsInfoComponent', () => {
  let component: ViewsInfoComponent;
  let fixture: ComponentFixture<ViewsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewsInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
