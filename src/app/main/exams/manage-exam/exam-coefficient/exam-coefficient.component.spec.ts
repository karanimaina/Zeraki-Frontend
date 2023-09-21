import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamCoefficientComponent } from './exam-coefficient.component';

describe('ExamCoefficientComponent', () => {
  let component: ExamCoefficientComponent;
  let fixture: ComponentFixture<ExamCoefficientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamCoefficientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamCoefficientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
