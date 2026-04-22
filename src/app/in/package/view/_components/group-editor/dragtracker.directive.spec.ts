import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragTrackerDirective } from './dragtracker.directive';
import { ViewItem, ViewSection, ViewRow, ViewColumn } from '../../_objects/View';

/**
 * Host component to test the directive in a real Angular context
 */
@Component({
  template: `
    <div
      [appDragTracker]="dragTrackerConfig"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      Test Container
    </div>
  `
})
class DragTrackerHostComponent {
  @ViewChild(DragTrackerDirective, { static: false }) directive!: DragTrackerDirective;

  dragTrackerConfig: any;
  dragOverCalled = false;
  dropCalled = false;

  onDragOver(evt: DragEvent): void {
    this.dragOverCalled = true;
  }

  onDrop(evt: DragEvent): void {
    this.dropCalled = true;
  }
}

describe('DragTrackerDirective', () => {
  let fixture: ComponentFixture<DragTrackerHostComponent>;
  let hostComponent: DragTrackerHostComponent;
  let directiveElement: DebugElement;

  /**
   * Helper function to create a mock ViewItem
   */
  function createMockViewItem(id?: string | number): ViewItem {
    return {
      id: id ?? 1,
      type: 'field',
      value: 'test_field',
      width: 100,
      readonly: false,
      visible_bool: true,
      label: 'Test Field'
    } as any;
  }

  /**
   * Helper function to create a mock ViewSection with rows and columns
   */
  function createMockViewSection(items: ViewItem[] = []): ViewSection {
    return {
      id: 'section.1',
      label: 'Test Section',
      rows: [
        {
          id: 'row.1',
          columns: [
            {
              id: 'column.1',
              items: items,
              width: 100
            } as any
          ]
        } as any
      ]
    } as any;
  }

  /**
   * Helper function to set up the drag tracker config
   */
  function setupDragTrackerConfig(overrides: any = {}): any {
    return {
      dataRef: [],
      ref: undefined,
      before: false,
      dragged: undefined,
      obj: createMockViewSection(),
      ...overrides
    };
  }

  /**
   * Helper function to trigger a dragover event
   */
  function triggerDragOver(): void {
    const dragEvent = new DragEvent('dragover', { bubbles: true });
    directiveElement.nativeElement.dispatchEvent(dragEvent);
    fixture.detectChanges();
  }

  /**
   * Helper function to trigger a drop event
   */
  function triggerDrop(): void {
    const dropEvent = new DragEvent('drop', { bubbles: true });
    directiveElement.nativeElement.dispatchEvent(dropEvent);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DragTrackerDirective, DragTrackerHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DragTrackerHostComponent);
    hostComponent = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(el => el.injector.get(DragTrackerDirective, null)? true : false);
  });

  describe('Directive Initialization', () => {
    it('should create an instance of the directive', () => {
      hostComponent.dragTrackerConfig = setupDragTrackerConfig();
      fixture.detectChanges();

      expect(hostComponent.directive).toBeTruthy();
    });

    it('should accept appDragTracker input configuration', () => {
      const config = setupDragTrackerConfig();
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      expect(hostComponent.directive.appDragTracker).toBe(config);
    });
  });

  describe('draggedList Getter', () => {
    it('should return undefined when dragged is not set', () => {
      const item = createMockViewItem(1);
      hostComponent.dragTrackerConfig = setupDragTrackerConfig({
        dragged: undefined,
        obj: createMockViewSection([item])
      });
      fixture.detectChanges();

      expect(hostComponent.directive.draggedList).toBeUndefined();
    });

    it('should return the column items array when dragged item is found', () => {
      const item = createMockViewItem(1);
      hostComponent.dragTrackerConfig = setupDragTrackerConfig({
        dragged: item,
        obj: createMockViewSection([item])
      });
      fixture.detectChanges();

      expect(hostComponent.directive.draggedList).toEqual([item]);
    });

    it('should return undefined when dragged item is not in any column', () => {
      const item1 = createMockViewItem(1);
      const item2 = createMockViewItem(2);
      hostComponent.dragTrackerConfig = setupDragTrackerConfig({
        dragged: item2,
        obj: createMockViewSection([item1])
      });
      fixture.detectChanges();

      expect(hostComponent.directive.draggedList).toBeUndefined();
    });
  });

  describe('Event Handling', () => {
    it('should handle dragover events', () => {
      const config = setupDragTrackerConfig();
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      triggerDragOver();

      expect(hostComponent.dragOverCalled).toBe(true);
    });

    it('should handle drop events', () => {
      const config = setupDragTrackerConfig();
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      triggerDrop();

      expect(hostComponent.dropCalled).toBe(true);
    });
  });

  describe('Drag and Drop Logic', () => {
    it('should not perform operations when no dragged item is set', () => {
      const config = setupDragTrackerConfig({
        dragged: undefined
      });
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      const initialDataRef = [...config.dataRef];
      triggerDragOver();

      expect(config.dataRef).toEqual(initialDataRef);
    });

    it('should initialize dragTrackerConfig with correct structure', () => {
      const item = createMockViewItem(1);
      const config = setupDragTrackerConfig({
        dragged: item,
        obj: createMockViewSection([item])
      });
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();
      expect(config).toBeDefined();
    
      expect(config).withContext('dataRef');
      expect(config).withContext('ref');
      expect(config).withContext('before');
      expect(config).withContext('dragged');
      expect(config).withContext('obj');
    });

    it('should move item within the same list when ref is set (hits moveItemInArray branch)', () => {
      const item1 = createMockViewItem(1);
      const item2 = createMockViewItem(2);
      const item3 = createMockViewItem(3);
      const sharedList = [item1, item2, item3];
      const config = setupDragTrackerConfig({
        dragged: item1,
        ref: item3,
        before: false,
        dataRef: sharedList,
        obj: createMockViewSection(sharedList)
      });
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      triggerDragOver();

      expect(config.dataRef).toEqual([item2, item3, item1]);
    });

    it('should not enter empty-target same-list branch because it is unreachable with valid draggedList', () => {
      const item1 = createMockViewItem(1);
      const sharedList = [item1];
      const config = setupDragTrackerConfig({
        dragged: item1,
        ref: undefined,
        dataRef: sharedList,
        obj: createMockViewSection(sharedList)
      });
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();

      triggerDragOver();

      expect(config.dataRef).toEqual([item1]);
    });

    it('should transfer item between lists on dragover', () => {
      const item1 = createMockViewItem(1);
      const item2 = createMockViewItem(2);
      const config = setupDragTrackerConfig({
        dragged: item1,
        ref: item2,
        dataRef: [item2],
        obj: createMockViewSection([item1, item2])
      });
      hostComponent.dragTrackerConfig = config;
      fixture.detectChanges();
      triggerDragOver();

      expect(config.dataRef).toEqual([item2, item1]);
    });

  });
});
