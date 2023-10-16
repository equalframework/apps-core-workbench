import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderActionsComponent } from './header-actions.component';
import { ViewHeader } from '../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('HeaderActionsComponent', () => {
  let component: HeaderActionsComponent;
  let fixture: ComponentFixture<HeaderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderActionsComponent);
    component = fixture.componentInstance;
    component.h_scheme = new ViewHeader({},"form")
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
