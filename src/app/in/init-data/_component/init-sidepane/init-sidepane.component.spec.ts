import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitSidepaneComponent } from './init-sidepane.component';

describe('InitSidepaneComponent', () => {
  let component: InitSidepaneComponent;
  let fixture: ComponentFixture<InitSidepaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitSidepaneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitSidepaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
