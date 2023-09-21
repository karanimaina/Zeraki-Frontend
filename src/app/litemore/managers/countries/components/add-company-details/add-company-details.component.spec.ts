import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompanyDetailsComponent } from './add-company-details.component';

describe('AddCompanyDetailsComponent', () => {
  let component: AddCompanyDetailsComponent;
  let fixture: ComponentFixture<AddCompanyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCompanyDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompanyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
