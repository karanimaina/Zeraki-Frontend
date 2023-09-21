import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TzReportFormsComponent } from './tz-report-forms.component';

describe('TzReportFormsComponent', () => {
  let component: TzReportFormsComponent;
  let fixture: ComponentFixture<TzReportFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TzReportFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TzReportFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
