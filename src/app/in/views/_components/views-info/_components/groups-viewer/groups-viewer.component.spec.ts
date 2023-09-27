import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsViewerComponent } from './groups-viewer.component';

describe('GroupsViewerComponent', () => {
  let component: GroupsViewerComponent;
  let fixture: ComponentFixture<GroupsViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupsViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
