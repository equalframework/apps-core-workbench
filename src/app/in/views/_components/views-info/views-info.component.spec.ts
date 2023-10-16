import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ViewsInfoComponent } from './views-info.component';
import { SharedLibModule } from 'sb-shared-lib';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewsInfoComponent', () => {
  let component: ViewsInfoComponent;
  let fixture: ComponentFixture<ViewsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [SharedLibModule],
      declarations: [ ViewsInfoComponent ],
      providers : [TranslateFakeLoader]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewsInfoComponent);
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
});
