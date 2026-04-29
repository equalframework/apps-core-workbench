import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderActionsComponent } from './header-actions.component';
import { ViewHeader, ViewPreDefAction } from '../../_objects/View';
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
    component.hScheme = new ViewHeader({}, 'form');
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

  describe('del', () => {
    it('should delete action from scheme', () => {
      const action = component.hScheme.actions['key'] = { acts: [new ViewPreDefAction()] } as any;
      component.del('key', action.acts[0]);
      expect(action.acts.length).toBe(0);
    });
  });

  describe('create', () => {
    it('should add action to scheme', () => {
      component.hScheme.actions['key'] = { acts: [] } as any;
      component.create('key');
      expect(component.hScheme.actions['key'].acts.length).toBe(1);
    });
  });
});
