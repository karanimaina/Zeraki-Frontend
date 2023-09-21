import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelDownloadTemplateComponent } from './excel-download-template.component';

describe('ExcelDownloadTemplateComponent', () => {
  let component: ExcelDownloadTemplateComponent;
  let fixture: ComponentFixture<ExcelDownloadTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelDownloadTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelDownloadTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
