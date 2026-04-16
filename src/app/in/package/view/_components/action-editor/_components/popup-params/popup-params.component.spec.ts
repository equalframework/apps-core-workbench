import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { PopupParamsComponent } from './popup-params.component';
import { SharedLibModule } from 'sb-shared-lib';
import { ViewAction } from '../../../../_objects/View';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { WorkbenchService } from 'src/app/in/_services/workbench.service';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('PopupParamsComponent', () => {
  let component: PopupParamsComponent;
  let fixture: ComponentFixture<PopupParamsComponent>;
  let mockWorkbenchService: jasmine.SpyObj<WorkbenchService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<PopupParamsComponent>>;

  beforeEach(async () => {
    mockWorkbenchService = jasmine.createSpyObj('WorkbenchService', ['announceController']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockWorkbenchService.announceController.and.returnValue(
      of({
        announcement: {
          params: {}
        }
      })
    );

    await TestBed.configureTestingModule({
      imports : [ SharedLibModule ],
      declarations: [ PopupParamsComponent ],
      providers : [
        TranslateFakeLoader,
        { provide: WorkbenchService, useValue: mockWorkbenchService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: new ViewAction() }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupParamsComponent);
    component = fixture.componentInstance;
    component.data = new ViewAction();
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

  it('should initialize scheme and construct params on init', async () => {
    const scheme = {
      announcement: {
        params: {
          name: { type: 'string' }
        }
      }
    };
    component.data.controller = 'test.controller';
    component.data.params = { name: 'alice' };
    mockWorkbenchService.announceController.and.returnValue(of(scheme));
    spyOn(component, 'conStruct');

    await component.ngOnInit();

    expect(mockWorkbenchService.announceController).toHaveBeenCalledWith('do', 'test.controller');
    expect(component.scheme).toEqual(scheme);
    expect(component.conStruct).toHaveBeenCalledWith({ name: 'alice' });
  });

  it('should build struct for enabled and disabled params', () => {
    component.scheme = {
      announcement: {
        params: {
          text: { type: 'string' },
          count: { type: 'integer' }
        }
      }
    };
    const getContentSpy = spyOn(component, 'getContent').and.callThrough();

    component.conStruct({ text: 'value' });

    expect(component.struct.text.enabled).toBeTrue();
    expect(component.struct.text.content).toBe('value');
    expect(component.struct.count.enabled).toBeFalse();
    expect(component.struct.count.content).toBeUndefined();
    expect(getContentSpy).toHaveBeenCalledWith('text');
    expect(getContentSpy).not.toHaveBeenCalledWith('count');
  });

  it('should format array content for display', () => {
    component.struct.tags = {
      info: { type: 'array' },
      content: ['a', 'b'],
      enabled: true,
      disp: ''
    };

    component.getContent('tags');

    expect(component.struct.tags.disp).toBe('[ a,b ]');
  });

  it('should copy scalar content to display', () => {
    component.struct.name = {
      info: { type: 'string' },
      content: 'alice',
      enabled: true,
      disp: ''
    };

    component.getContent('name');

    expect(component.struct.name.disp).toBe('alice');
  });

  it('should parse array values from display string', () => {
    component.struct.tags = {
      info: { type: 'array' },
      content: [],
      enabled: true,
      disp: ''
    };

    component.setContent('tags', '[ one, two ]');

    expect(component.struct.tags.content).toEqual(['one', 'two']);
    expect(component.struct.tags.disp).toBe('[ one,two ]');
  });

  it('should parse empty array values from display string', () => {
    component.struct.tags = {
      info: { type: 'array' },
      content: ['x'],
      enabled: true,
      disp: ''
    };

    component.setContent('tags', '[]');

    expect(component.struct.tags.content).toEqual([]);
    expect(component.struct.tags.disp).toBe('[  ]');
  });

  it('should parse integer values', () => {
    component.struct.count = {
      info: { type: 'integer' },
      content: undefined,
      enabled: true,
      disp: ''
    };

    component.setContent('count', '42');

    expect(component.struct.count.content).toBe(42);
    expect(component.struct.count.disp).toBe(42 as any);
  });

  it('should keep raw value for non array and non integer', () => {
    component.struct.name = {
      info: { type: 'string' },
      content: undefined,
      enabled: true,
      disp: ''
    };

    component.setContent('name', 'bob');

    expect(component.struct.name.content).toBe('bob');
    expect(component.struct.name.disp).toBe('bob');
  });

  it('should save only enabled params and close dialog', () => {
    component.data.params = { stale: true } as any;
    component.struct = {
      enabledText: {
        info: { type: 'string' },
        content: 'old',
        enabled: true,
        disp: 'new'
      },
      disabledCount: {
        info: { type: 'integer' },
        content: 5,
        enabled: false,
        disp: '9'
      }
    };

    component.save();

    expect(component.data.params).toEqual({ enabledText: 'new' });
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog on exit', () => {
    component.exit();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
