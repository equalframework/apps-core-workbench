import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreDefActionEditorComponent } from './predef-action-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ViewPreDefAction } from '../../../../_objects/View';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('PreDefActionEditorComponent', () => {
  let component: PreDefActionEditorComponent;
  let fixture: ComponentFixture<PreDefActionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreDefActionEditorComponent, MatAutocomplete ],
      imports: [MatDialogModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreDefActionEditorComponent);
    component = fixture.componentInstance;
    component.controllers = [];
    component.obj = new ViewPreDefAction();
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

  describe('tap', () => {
    it('should filter groups based on controller', () => {
      component.controllers = ['ControllerOne', 'ControllerTwo', 'AnotherController'];
      component.obj.controller = 'controller';
      component.tap('');
      expect(component.filteredOptions).toEqual(['', 'ControllerOne', 'ControllerTwo', 'AnotherController']);
      component.obj.controller = 'one';
      component.tap('');
      expect(component.filteredOptions).toEqual(['', 'ControllerOne']);
    });
  });

  describe('tap2', () => {
    it('should filter groups based on input', () => {
      component.groups = ['GroupOne', 'GroupTwo', 'AnotherGroup'];
      component.tap2('one');
      expect(component.filteredGroups).toEqual(['GroupOne']);
    });
  });

  describe('addGroup', () => {
    it('should add a group if it does not exist and input is not empty', () => {
      component.input = 'NewGroup';
      component.addGroup();
      expect(component.obj.access.groups).toContain('NewGroup');
    });

    it('should not add a group if it already exists', () => {
      component.obj.access.groups = ['ExistingGroup'];
      component.input = 'ExistingGroup';
      component.addGroup();
      expect(component.obj.access.groups).toEqual(['ExistingGroup']);
    });
  });

  describe('delete_element', () => {
    it('should delete a group from the access groups', () => {
      component.obj.access.groups = ['GroupToDelete', 'AnotherGroup'];
      component.delete_element('GroupToDelete');
      expect(component.obj.access.groups).toEqual(['AnotherGroup']);
    });
  });

  describe('changeBigDispBy', () => {
    it('should set bigDisp to true when input is true', () => {
      component.changeBigDispBy(true);
      expect(component.bigDisp).toBe(true);
    });

    it('should not change bigDisp when input is false', () => {
      component.bigDisp = true;
      component.changeBigDispBy(false);
      expect(component.bigDisp).toBe(true);
    });
  });
});
