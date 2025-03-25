import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPolicyComponent } from './info-policy.component';

describe('InfoPolicyComponent', () => {
  let component: InfoPolicyComponent;
  let fixture: ComponentFixture<InfoPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
