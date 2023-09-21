import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentNotesItemsComponent } from './student-notes-items.component';

describe('StudentNotesItemsComponent', () => {
  let component: StudentNotesItemsComponent;
  let fixture: ComponentFixture<StudentNotesItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentNotesItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentNotesItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
