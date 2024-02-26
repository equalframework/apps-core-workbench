import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSaverComponent } from './file-saver.component';

describe('FileSaverComponent', () => {
  let component: FileSaverComponent;
  let fixture: ComponentFixture<FileSaverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileSaverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSaverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
