import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VieweditorComponent } from './vieweditor.component';


import { RouterTestingModule } from '@angular/router/testing';
import { SharedLibModule } from 'sb-shared-lib';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('VieweditorComponent', () => {
  let component: VieweditorComponent;
  let fixture: ComponentFixture<VieweditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule,SharedLibModule],
      declarations: [ VieweditorComponent ],
      providers : [TranslateFakeLoader]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VieweditorComponent);
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
