import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteEditComponent } from './route-edit.component';
import { SharedLibModule } from 'sb-shared-lib';
import { ViewRoute } from '../../../_objects/View';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EqualComponentsProviderService } from 'src/app/in/_services/equal-components-provider.service';

describe('RouteEditComponent', () => {
  let component: RouteEditComponent;
  let fixture: ComponentFixture<RouteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedLibModule, BrowserAnimationsModule],
      declarations: [ RouteEditComponent ],
      teardown: { destroyAfterEach: false }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteEditComponent);
    component = fixture.componentInstance;
    component.route = new ViewRoute();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateAutocomplete', () => {
    it('should filter model list based on input value', () => {
      component.modelList = ['ModelOne', 'ModelTwo', 'Another'];
      component.updateAutocomplete('Model');
      expect(component.filteredModelList).toEqual(['ModelOne', 'ModelTwo']);
    });
  });

  describe('refreshViewList', () => {
    it('should call equalComponentsProviderService.getComponents with correct parameters', () => {
      const service = TestBed.inject(EqualComponentsProviderService);
      spyOn(service, 'getComponents').and.returnValue({
        subscribe: (callback: any) => callback([{ package_name: 'TestPackage', name: 'TestView' }])
      } as any);
      component.refreshViewList('TestPackage\\TestEntity');
      expect(service.getComponents).toHaveBeenCalledWith('TestPackage', 'view', 'TestEntity');
      expect(component.extEntityViewList).toEqual(['TestPackage:TestView']);
    });
  });

  describe('onClickDelete', () => {
    it('should emit deleteMe event', () => {
      spyOn(component.deleteMe, 'emit');
      component.onClickDelete();
      expect(component.deleteMe.emit).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should set default entity and refresh view list', () => {
      component.packageName = 'TestPackage';
      component.entity = 'TestEntity';
      component.modelList = [];
      component.ngOnInit();
      expect(component.route.context.entity).toBe('TestPackage\\TestEntity');
    });

    it('should add default entity to filteredModelList if not present', () => {
      component.packageName = 'TestPackage';
      component.entity = 'TestEntity';
      component.modelList = [];
      component.ngOnInit();
      expect(component.filteredModelList).toContain('TestPackage\\TestEntity');

      component.modelList = ['TestPackage\\TestEntity'];
      component.ngOnInit();
      expect(component.filteredModelList).toEqual(['TestPackage\\TestEntity']);
    });
    });
});
