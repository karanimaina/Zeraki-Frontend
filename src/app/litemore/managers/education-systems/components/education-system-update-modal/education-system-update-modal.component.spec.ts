import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationSystemUpdateModalComponent } from './education-system-update-modal.component';

describe('EducationSystemUpdateModalComponent', () => {
  let component: EducationSystemUpdateModalComponent;
  let fixture: ComponentFixture<EducationSystemUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EducationSystemUpdateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationSystemUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
