import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsTypeComponent } from './schools-type.component';

describe('SchoolsTypeComponent', () => {
  let component: SchoolsTypeComponent;
  let fixture: ComponentFixture<SchoolsTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchoolsTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
