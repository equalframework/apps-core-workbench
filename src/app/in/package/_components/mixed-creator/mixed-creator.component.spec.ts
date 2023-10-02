import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixedCreatorComponent } from './mixed-creator.component';

describe('MixedCreatorComponent', () => {
  let component: MixedCreatorComponent;
  let fixture: ComponentFixture<MixedCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MixedCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixedCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
