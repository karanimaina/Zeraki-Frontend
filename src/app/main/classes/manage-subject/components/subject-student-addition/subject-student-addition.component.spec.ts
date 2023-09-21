import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectStudentAdditionComponent } from './subject-student-addition.component';

describe('SubjectStudentAdditionComponent', () => {
  let component: SubjectStudentAdditionComponent;
  let fixture: ComponentFixture<SubjectStudentAdditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectStudentAdditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectStudentAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
