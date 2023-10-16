import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MixedCreatorComponent } from './mixed-creator.component';
import { SharedLibModule } from 'sb-shared-lib';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MixedCreatorComponent', () => {
  let component: MixedCreatorComponent;
  let fixture: ComponentFixture<MixedCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [SharedLibModule,BrowserAnimationsModule],
      declarations: [ MixedCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixedCreatorComponent);
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
