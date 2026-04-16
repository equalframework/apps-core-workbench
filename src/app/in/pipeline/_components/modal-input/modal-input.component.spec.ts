import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalInputComponent } from './modal-input.component';

describe('ModalInputComponent', () => {
  let component: ModalInputComponent;
  let fixture: ComponentFixture<ModalInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalInputComponent ],
      providers: [
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { 
            pair: { key: 'testKey', value: { type: 'string' } },
            value: 'testValue'
          } 
        },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'dismiss']) }
      ]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
