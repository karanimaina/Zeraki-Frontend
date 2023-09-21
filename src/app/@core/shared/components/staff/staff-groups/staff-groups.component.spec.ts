import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffGroupsComponent } from './staff-groups.component';

describe('StaffGroupsComponent', () => {
  let component: StaffGroupsComponent;
  let fixture: ComponentFixture<StaffGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
