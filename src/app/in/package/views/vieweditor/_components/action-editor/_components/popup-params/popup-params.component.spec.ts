import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { PopupParamsComponent } from './popup-params.component';
import { SharedLibModule } from 'sb-shared-lib';
import { ViewAction } from '../../../../_objects/View';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('PopupParamsComponent', () => {
  let component: PopupParamsComponent;
  let fixture: ComponentFixture<PopupParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [ SharedLibModule ],
      declarations: [ PopupParamsComponent ],
      providers : [TranslateFakeLoader]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupParamsComponent);
    component = fixture.componentInstance;
    component.data = new ViewAction()
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
