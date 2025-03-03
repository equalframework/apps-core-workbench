import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemViewerComponent } from './item-viewer.component';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

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
    component.item_scheme = []
    fixture.detectChanges();
  });

  beforeAll(() => {
    // Deactivate teardown for these tests because of a problem with
    // the primeNg dialog.
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
        {teardown: {destroyAfterEach: false}}
      );
  });

  beforeAll(() => {
    // Deactivate teardown for these tests because of a problem with
    // the primeNg dialog.
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
        {teardown: {destroyAfterEach: false}}
      );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
