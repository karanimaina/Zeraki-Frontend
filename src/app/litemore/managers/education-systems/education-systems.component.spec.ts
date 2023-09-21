import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationSystemsComponent } from './education-systems.component';

describe('EducationSystemsComponent', () => {
  let component: EducationSystemsComponent;
  let fixture: ComponentFixture<EducationSystemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationSystemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationSystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
