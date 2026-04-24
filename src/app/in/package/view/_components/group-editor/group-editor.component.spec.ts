import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewRow, ViewColumn, ViewItem } from '../../_objects/View';
import { GroupEditorComponent } from './group-editor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ViewSection } from '../../_objects/View';

describe('GroupEditorComponent', () => {
  let component: GroupEditorComponent;
  let fixture: ComponentFixture<GroupEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupEditorComponent ],
      imports: [MatDialogModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupEditorComponent);
    component = fixture.componentInstance;
    component.groupObj = [];
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

  describe('delSection', () => {
    it('should delete the selected section', () => {
      const section1 = new ViewSection({ rows: [], visible: true, _has_domain: true });
      const section2 = new ViewSection({ rows: [], visible: true, _has_domain: true });
      component.groupObj = [section1, section2];
      component.selected = section1;
      component.delSection();
      expect(component.groupObj).toEqual([section2]);
    });
  });

  describe('editSection', () => {
    it('should open the edit section dialog', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(true) })
      } as any);
      const section = new ViewSection({ rows: [], visible: true, _has_domain: true });
      component.editSection(section);
      expect(component['matDialog'].open).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should update selectedIndex when selected changes', () => {
      const section1 = new ViewSection({ rows: [], visible: true, _has_domain: true });
      const section2 = new ViewSection({ rows: [], visible: true, _has_domain: true });
      component.groupObj = [section1, section2];
      component.selected = section2;
      component.ngOnChanges();
      expect(component.selectedIndex).toBe(1);
    });
  });

  describe('addSection', () => {
    it('should add a new section to groupObj', () => {
      component.groupObj = [];
      component.addSection();
      expect(component.groupObj.length).toBe(1);
      expect(component.groupObj[0].label).toBe('New Section');
    });
  });

  describe('addRow', () => {
    it('should add a new row to the selected section', () => {
      const section = new ViewSection({ rows: [], visible: true, _has_domain: true });
      component.groupObj = [section];
      component.selected = section;
      component.addRow();
      expect(component.selected?.rows.length).toBe(1);
      expect(component.selected?.rows[0].label).toBe('New Row');
    });
  });

  describe('delRow', () => {
    it('should delete the specified row from the selected section', () => {
      const section = new ViewSection({ rows: [
        { label: 'Row 1' },
        { label: 'Row 2' }
      ], visible: true, _has_domain: true });
      const row1 = section.rows[0];
      component.groupObj = [section];
      component.selected = section;
      component.delRow(row1);
      expect(component.selected?.rows.length).toBe(1);
      expect(component.selected?.rows[0].label).toBe('Row 2');
    });
  });

  describe('editRow', () => {
    it('should open the edit row dialog', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(true) })
      } as any);
      const row = { label: 'Row 1' } as ViewRow;
      const section = new ViewSection({ rows: [row], visible: true, _has_domain: true });
      component.groupObj = [section];
      component.selected = section;
      component.editRow(row);
      expect(component['matDialog'].open).toHaveBeenCalled();
    });

    it('should update the row in selected?.rows after editing', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(new ViewRow({ label: 'Updated Row' })) })
      } as any);
      const section = new ViewSection({ rows: [{ label: 'Row 1' }], visible: true, _has_domain: true });
      const row = section.rows[0];
      component.groupObj = [section];
      component.selected = section;
      component.editRow(row);
      expect(section.rows[0].label).toBe('Updated Row');
    });
  });

  describe('addCol', () => {
    it('should add a new column to the specified row', () => {
      const section = new ViewSection({ rows: [{ label: 'Row 1' }], visible: true, _has_domain: true });
      const row = section.rows[0];
      component.groupObj = [section];
      component.selected = section;
      component.addCol(row);
      expect(row.columns.length).toBe(1);
      expect(row.columns[0].label).toBe('New Column');
    });
  });

  describe('delColumn', () => {
    it('should delete the specified column from the specified row', () => {
      const section = new ViewSection({ rows: [{ label: 'Row 1', columns: [{ label: 'Column 1' }, { label: 'Column 2' }] }], visible: true, _has_domain: true });
      const row = section.rows[0];
      const col1 = row.columns[0];
      component.groupObj = [section];
      component.selected = section;
      component.delColumn(row, col1);
      expect(row.columns.length).toBe(1);
      expect(row.columns[0].label).toBe('Column 2');
    });
  });

  describe('editColumn', () => {
    it('should open the edit column dialog', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(true) })
      } as any);
      const col = { label: 'Column 1' } as ViewColumn;
      const row = { label: 'Row 1', columns: [col] } as ViewRow;
      const section = new ViewSection({ rows: [row], visible: true, _has_domain: true });
      component.groupObj = [section];
      component.selected = section;
      component.editColumn(col);
      expect(component['matDialog'].open).toHaveBeenCalled();
    });

    it('should update the column in the specified row after editing', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(new ViewColumn({ label: 'Updated Column' })) })
      } as any);
      const section = new ViewSection({ rows: [{ label: 'Row 1', columns: [{ label: 'Column 1' }] }], visible: true, _has_domain: true });
      const row = section.rows[0];
      const col = row.columns[0];
      component.groupObj = [section];
      component.selected = section;
      component.editColumn(col);
      expect(row.columns[0].label).toBe('Updated Column');
    });
  });

  describe('addItem', () => {
    it('should add a new item to the specified column', () => {
      const section = new ViewSection({ rows: [{ label: 'Row 1', columns: [{ label: 'Column 1' }] }], visible: true, _has_domain: true });
      const row = section.rows[0];
      const col = row.columns[0];
      component.groupObj = [section];
      component.selected = section;
      component.addItem(col);
      expect(col.items.length).toBe(1);
      expect(col.items[0].value).toBe('New Item');
    });
  });

  describe('editItem', () => {
    it('should open the edit item dialog', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(true) })
      } as any);
      const item = { value: 'Item 1' } as ViewItem;
      const col = { label: 'Column 1', items: [item] } as ViewColumn;
      const row = { label: 'Row 1', columns: [col] } as ViewRow;
      const section = new ViewSection({ rows: [row], visible: true, _has_domain: true });
      component.groupObj = [section];
      component.selected = section;
      component.editItem(item);
      expect(component['matDialog'].open).toHaveBeenCalled();
    });

    it('should update the item in the specified column after editing', () => {
      spyOn(component['matDialog'], 'open').and.returnValue({
        afterClosed: () => ({ subscribe: (callback: any) => callback(new ViewItem({ value: 'Updated Item' })) })
      } as any);
      const section = new ViewSection({ rows: [{ label: 'Row 1', columns: [{ label: 'Column 1', items: [{ value: 'Item 1' }] }] }], visible: true, _has_domain: true });
      const row = section.rows[0];
      const col = row.columns[0];
      const item = col.items[0];
      component.groupObj = [section];
      component.selected = section;
      component.editItem(item);
      expect(col.items[0].value).toBe('Updated Item');
    });
  });

  describe('delItem', () => {
    it('should delete the specified item from the specified column', () => {
      const section = new ViewSection({ rows: [{ label: 'Row 1', columns: [{ label: 'Column 1', items: [{ value: 'Item 1' }, { value: 'Item 2' }] }] }], visible: true, _has_domain: true });
      const row = section.rows[0];
      const col = row.columns[0];
      const item1 = col.items[0];
      component.groupObj = [section];
      component.selected = section;
      component.delItem(col, item1);
      expect(col.items.length).toBe(1);
      expect(col.items[0].value).toBe('Item 2');
    });
  });
});
