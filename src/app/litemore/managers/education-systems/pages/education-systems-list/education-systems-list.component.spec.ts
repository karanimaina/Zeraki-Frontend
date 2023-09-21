import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationSystemsListComponent } from './education-systems-list.component';

describe('EducationSystemsListComponent', () => {
  let component: EducationSystemsListComponent;
  let fixture: ComponentFixture<EducationSystemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationSystemsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationSystemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
