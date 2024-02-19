import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAutocompleteComponent } from './multi-autocomplete.component';

describe('AutocompleteComponent', () => {
  let component: MultiAutocompleteComponent;
  let fixture: ComponentFixture<MultiAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiAutocompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
