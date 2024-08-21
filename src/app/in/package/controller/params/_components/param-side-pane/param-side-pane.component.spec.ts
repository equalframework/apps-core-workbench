import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamSidePaneComponent } from './param-side-pane.component';

describe('ParamSidePaneComponent', () => {
  let component: ParamSidePaneComponent;
  let fixture: ComponentFixture<ParamSidePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamSidePaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamSidePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
