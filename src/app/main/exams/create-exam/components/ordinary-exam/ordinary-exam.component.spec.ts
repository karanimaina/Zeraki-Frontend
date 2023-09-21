import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdinaryExamComponent } from './ordinary-exam.component';

describe('OrdinaryExamComponent', () => {
  let component: OrdinaryExamComponent;
  let fixture: ComponentFixture<OrdinaryExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdinaryExamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdinaryExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
