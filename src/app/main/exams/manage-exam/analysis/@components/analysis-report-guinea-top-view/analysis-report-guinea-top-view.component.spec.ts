import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisReportGuineaTopViewComponent } from './analysis-report-guinea-top-view.component';

describe('AnalysisReportGuineaTopViewComponent', () => {
  let component: AnalysisReportGuineaTopViewComponent;
  let fixture: ComponentFixture<AnalysisReportGuineaTopViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalysisReportGuineaTopViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalysisReportGuineaTopViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
