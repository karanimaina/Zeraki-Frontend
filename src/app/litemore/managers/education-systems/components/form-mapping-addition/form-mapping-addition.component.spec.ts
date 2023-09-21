import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMappingAdditionComponent } from './form-mapping-addition.component';

describe('FormMappingAdditionComponent', () => {
  let component: FormMappingAdditionComponent;
  let fixture: ComponentFixture<FormMappingAdditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormMappingAdditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMappingAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
