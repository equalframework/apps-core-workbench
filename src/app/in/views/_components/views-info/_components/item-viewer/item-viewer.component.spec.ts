import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemViewerComponent } from './item-viewer.component';

describe('ItemViewerComponent', () => {
  let component: ItemViewerComponent;
  let fixture: ComponentFixture<ItemViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
