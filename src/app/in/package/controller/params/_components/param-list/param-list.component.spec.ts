import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamListComponent } from './param-list.component';

describe('ParamListComponent', () => {
  let component: ParamListComponent;
  let fixture: ComponentFixture<ParamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
