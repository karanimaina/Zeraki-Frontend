import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNotePrintPreviewComponent } from './credit-note-print-preview.component';

describe('CreditNotePrintPreviewComponent', () => {
  let component: CreditNotePrintPreviewComponent;
  let fixture: ComponentFixture<CreditNotePrintPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditNotePrintPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditNotePrintPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
