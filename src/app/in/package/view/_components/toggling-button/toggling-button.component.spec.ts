import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglingButtonComponent } from './toggling-button.component';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('TogglingButtonComponent', () => {
  let component: TogglingButtonComponent;
  let fixture: ComponentFixture<TogglingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TogglingButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglingButtonComponent);
    component = fixture.componentInstance;
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

  it('should toggle baseState from true to false', () => {
    component.baseState = true;
    component.toggleIt();
    expect(component.baseState).toBe(false);
  });

  it('should toggle baseState from false to true', () => {
    component.baseState = false;
    component.toggleIt();
    expect(component.baseState).toBe(true);
  });

  it('should emit new state on toggleIt', () => {
    component.baseState = true;
    let emittedValue: boolean | undefined;
    component.toggle.subscribe((val: boolean) => emittedValue = val);
    component.toggleIt();
    expect(emittedValue).toBe(false);
  });
});
