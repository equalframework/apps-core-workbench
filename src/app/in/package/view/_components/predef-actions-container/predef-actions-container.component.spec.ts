import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { PreDefActionsContainerComponent } from './predef-actions-container.component';
import { ViewPreDefAction } from '../../_objects/View';

describe('PreDefActionsContainerComponent', () => {
  let component: PreDefActionsContainerComponent;
  let fixture: ComponentFixture<PreDefActionsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreDefActionsContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreDefActionsContainerComponent);
    component = fixture.componentInstance;
    component.acts = [];
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

  it('should create a new predef action', () => {
    component.acts = [];
    component.create();
    expect(component.acts.length).toBe(1);
  });

  it('should delete predef action from list', () => {
    const action = new ViewPreDefAction();
    component.acts = [action];
    component.del(action);
    expect(component.acts.length).toBe(0);
  });

  it('should not fail deleting action not in list', () => {
    component.acts = [];
    component.del(new ViewPreDefAction());
    expect(component.acts.length).toBe(0);
  });
});
