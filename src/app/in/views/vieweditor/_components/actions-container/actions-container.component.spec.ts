import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsContainerComponent } from './actions-container.component';

describe('ActionsContainerComponent', () => {
  let component: ActionsContainerComponent;
  let fixture: ComponentFixture<ActionsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
