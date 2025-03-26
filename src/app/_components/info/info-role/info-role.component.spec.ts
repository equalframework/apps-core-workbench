import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRoleComponent } from './info-role.component';

describe('InfoRoleComponent', () => {
  let component: InfoRoleComponent;
  let fixture: ComponentFixture<InfoRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
