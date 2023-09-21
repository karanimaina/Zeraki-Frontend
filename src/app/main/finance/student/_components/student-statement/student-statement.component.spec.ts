import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentStatementComponent } from './student-statement.component';

describe('StudentStatementComponent', () => {
  let component: StudentStatementComponent;
  let fixture: ComponentFixture<StudentStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentStatementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
