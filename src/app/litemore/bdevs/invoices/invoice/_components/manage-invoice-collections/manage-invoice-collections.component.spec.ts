import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInvoiceCollectionsComponent } from './manage-invoice-collections.component';

describe('ManageInvoiceCollectionsComponent', () => {
  let component: ManageInvoiceCollectionsComponent;
  let fixture: ComponentFixture<ManageInvoiceCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageInvoiceCollectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageInvoiceCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
