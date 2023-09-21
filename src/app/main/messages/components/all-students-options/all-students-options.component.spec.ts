import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStudentsOptionsComponent } from './all-students-options.component';

describe('AllStudentsOptionsComponent', () => {
  let component: AllStudentsOptionsComponent;
  let fixture: ComponentFixture<AllStudentsOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllStudentsOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllStudentsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
