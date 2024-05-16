import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNameDescriptionComponent } from './modal-name-description.component';

describe('ModalNameDescriptionComponent', () => {
  let component: ModalNameDescriptionComponent;
  let fixture: ComponentFixture<ModalNameDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalNameDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNameDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
