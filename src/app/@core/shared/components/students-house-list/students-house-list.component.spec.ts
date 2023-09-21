import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsHouseListComponent } from './students-house-list.component';

describe('StudentsHouseListComponent', () => {
  let component: StudentsHouseListComponent;
  let fixture: ComponentFixture<StudentsHouseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentsHouseListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsHouseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
