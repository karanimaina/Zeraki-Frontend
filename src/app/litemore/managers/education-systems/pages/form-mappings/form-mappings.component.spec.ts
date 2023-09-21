import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMappingsComponent } from './form-mappings.component';

describe('FormMappingsComponent', () => {
  let component: FormMappingsComponent;
  let fixture: ComponentFixture<FormMappingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormMappingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
