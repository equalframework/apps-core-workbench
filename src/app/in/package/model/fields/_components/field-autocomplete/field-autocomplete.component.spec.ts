import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldAutocompleteComponent } from './field-autocomplete.component';

describe('FieldAutocompleteComponent', () => {
  let component: FieldAutocompleteComponent;
  let fixture: ComponentFixture<FieldAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checkValue', () => {
    it('should emit valueChange when value is in values and different from current value', () => {
      component.values = ['option1', 'option2'];
      component.value = 'option1';
      component.valueControl.setValue('option2');
      spyOn(component.valueChange, 'emit');
      component.checkValue();
      expect(component.valueChange.emit).toHaveBeenCalledWith('option2');
    });

    it('should not emit valueChange when value is not in values', () => {
      component.values = ['option1', 'option2'];
      component.valueControl.setValue('option3');
      spyOn(component.valueChange, 'emit');
      component.checkValue();
      expect(component.valueChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('resetEntry', () => {
    it('should reset valueControl to current value', () => {
      component.value = 'option1';
      component.valueControl.setValue('option2');
      component.resetEntry();
      expect(component.valueControl.value).toBe('option1');
    });
  });

  describe('noCancel', () => {
    it('should prevent default and stop propagation for Ctrl+Z', () => {
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.noCancel(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('should prevent default and stop propagation for Ctrl+Y', () => {
      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.noCancel(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });

    it('should not prevent default or stop propagation for other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopImmediatePropagation');
      component.noCancel(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset valueControl to current value and filter values', () => {
      component.values = ['option1', 'option2', 'option3'];
      component.value = 'option1';
      component.valueControl.setValue('option2');
      component.reset();
      expect(component.valueControl.value).toBe('option1');
      expect(component.fValues).toEqual(['option1']);
    });
  });
});
