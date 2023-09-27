import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VieweditorComponent } from './vieweditor.component';

describe('VieweditorComponent', () => {
  let component: VieweditorComponent;
  let fixture: ComponentFixture<VieweditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VieweditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VieweditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
