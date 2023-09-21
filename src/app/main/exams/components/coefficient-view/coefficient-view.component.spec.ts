import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoefficientViewComponent } from './coefficient-view.component';

describe('CoefficientViewComponent', () => {
  let component: CoefficientViewComponent;
  let fixture: ComponentFixture<CoefficientViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoefficientViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoefficientViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
