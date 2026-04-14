import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ParamListComponent } from './param-list.component';
import { Param } from '../../../../../_models/Params';

describe('ParamListComponent', () => {
  let component: ParamListComponent;
  let fixture: ComponentFixture<ParamListComponent>;

  const makeParam = (name: string): Param => new Param(name);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamListComponent ],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamListComponent);
    component = fixture.componentInstance;
    component.list = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort list by name on init', () => {
    component.list = [makeParam('zeta'), makeParam('Alpha'), makeParam('beta')];

    component.ngOnInit();

    expect(component.filteredList.map(p => p.name)).toEqual(['Alpha', 'beta', 'zeta']);
  });

  it('should filter list when filterControl value changes', () => {
    component.list = [makeParam('customer_id'), makeParam('invoice_date'), makeParam('amount')];
    component.ngOnInit();

    component.filterControl.setValue('DATE');

    expect(component.filteredList.map(p => p.name)).toEqual(['invoice_date']);
  });

  it('should recompute filtered list on ngOnChanges using current filter value', () => {
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.filterControl.setValue('be', { emitEvent: false });

    component.ngOnChanges();

    expect(component.filteredList.map(p => p.name)).toEqual(['beta']);
  });

  it('should emit selected index on click item', () => {
    spyOn(component.itemSelected, 'emit');

    component.onClickItem(3);

    expect(component.itemSelected.emit).toHaveBeenCalledWith(3);
  });

  it('should create item with custom name and emit CRUD message', () => {
    spyOn(component.CRUD, 'emit');
    component.list = [makeParam('alpha')];
    component.ngOnInit();
    component.createControl.setValue('new_custom_param');

    component.createItem();

    expect(component.list.length).toBe(2);
    expect(component.list[1].name).toBe('new_custom_param');
    expect(component.createControl.value).toBe('');
    expect(component.CRUD.emit).toHaveBeenCalledWith('Creation of a new param');
    expect(component.filteredList.map(p => p.name)).toEqual(['alpha', 'new_custom_param']);
  });

  it('should create default item name when createControl is empty', () => {
    component.list = [];
    component.ngOnInit();
    component.createControl.setValue('');

    component.createItem();
    component.createItem();

    expect(component.list[0].name).toBe('new_param_0');
    expect(component.list[1].name).toBe('new_param_1');
  });

  it('should delete item, emit CRUD and reset selection', () => {
    spyOn(component.CRUD, 'emit');
    spyOn(component, 'onClickItem');
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.ngOnInit();

    component.deleteItem(0);

    expect(component.list.map(p => p.name)).toEqual(['beta']);
    expect(component.CRUD.emit).toHaveBeenCalledWith('deletion of alpha');
    expect(component.onClickItem).toHaveBeenCalledWith(-1);
    expect(component.filteredList.map(p => p.name)).toEqual(['beta']);
  });

  it('should clear filter input', () => {
    component.filterControl.setValue('abc', { emitEvent: false });

    component.clearFilter();

    expect(component.filterControl.value).toBe('');
  });

  it('should return index in trackByFn', () => {
    const result = component.trackByFn(7, makeParam('x'));

    expect(result).toBe(7);
  });

  it('should return -1 if no param is selected', () => {
    const result = component.selectedIndex;
    expect(result).toBe(-1);
  });

  it('should return selected param name', () => {
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.selectedIndex = 1;
    const result = component.list[component.selectedIndex].name;
    expect(result).toBe('beta');
  });

  it('should filter list with special characters', () => {
    component.list = [makeParam('alpha'), makeParam('beta!'), makeParam('gamma123')];
    component.ngOnInit();

    component.filterControl.setValue('!');

    expect(component.filteredList.map(p => p.name)).toEqual(['beta!']);
  });

  it('should handle filtering with an empty list', () => {
    component.list = [];
    component.ngOnInit();

    component.filterControl.setValue('alpha');

    expect(component.filteredList).toEqual([]);
  });

  it('should not create duplicate items', () => {
    component.list = [makeParam('duplicate')];
    component.ngOnInit();

    component.createControl.setValue('duplicate');
    component.createItem();

    expect(component.list.length).toBe(1);
  });

  it('should keep createControl value when duplicate creation is rejected', () => {
    component.list = [makeParam('duplicate')];
    component.ngOnInit();

    component.createControl.setValue('duplicate');
    component.createItem();

    expect(component.createControl.value).toBe('duplicate');
  });

  it('should not delete item with invalid index', () => {
    spyOn(component.CRUD, 'emit');
    spyOn(component, 'onClickItem');
    component.list = [makeParam('alpha')];
    component.ngOnInit();

    component.deleteItem(5);

    expect(component.list.length).toBe(1);
    expect(component.CRUD.emit).not.toHaveBeenCalled();
    expect(component.onClickItem).not.toHaveBeenCalled();
  });

  it('should sort filtered list alphabetically', () => {
    component.list = [makeParam('delta'), makeParam('alpha'), makeParam('charlie')];
    component.ngOnInit();
    expect(component.filteredList.map(p => p.name)).toEqual(['alpha', 'charlie', 'delta']);
  });

  it('should filter list case-insensitively', () => {
    component.list = [makeParam('CustomerID'), makeParam('InvoiceDate'), makeParam('Amount')];
    component.ngOnInit();
    component.filterControl.setValue('customer');
    expect(component.filteredList.map(p => p.name)).toEqual(['CustomerID']);
  });

  it('should return empty list when filter does not match any item', () => {
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.ngOnInit();
    component.filterControl.setValue('gamma');
    expect(component.filteredList).toEqual([]);
  });

  it('should return full list when filter is cleared', () => {
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.ngOnInit();
    component.filterControl.setValue('alpha');
    expect(component.filteredList.map(p => p.name)).toEqual(['alpha']);
    component.clearFilter();
    expect(component.filteredList.map(p => p.name)).toEqual(['alpha', 'beta']);
  });

  it('should apply active filter after createItem', () => {
    component.list = [makeParam('alpha')];
    component.ngOnInit();
    component.filterControl.setValue('new', { emitEvent: false });
    component.createControl.setValue('new_custom_param');

    component.createItem();

    expect(component.filteredList.map(p => p.name)).toEqual(['new_custom_param']);
  });

  it('should treat null filter as empty during ngOnChanges', () => {
    component.list = [makeParam('alpha'), makeParam('beta')];
    component.filterControl.setValue(null as unknown as string, { emitEvent: false });

    component.ngOnChanges();

    expect(component.filteredList.map(p => p.name)).toEqual(['alpha', 'beta']);
  });


});
