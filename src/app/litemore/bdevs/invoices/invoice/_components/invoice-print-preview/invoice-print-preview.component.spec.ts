import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePrintPreviewComponent } from './invoice-print-preview.component';

describe('InvoicePrintPreviewComponent', () => {
  let component: InvoicePrintPreviewComponent;
  let fixture: ComponentFixture<InvoicePrintPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePrintPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePrintPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
