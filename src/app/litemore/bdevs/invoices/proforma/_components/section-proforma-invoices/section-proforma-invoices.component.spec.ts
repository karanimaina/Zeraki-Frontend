import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionProformaInvoicesComponent } from "./section-proforma-invoices.component";

describe("SectionProformaInvoicesComponent", () => {
	let component: SectionProformaInvoicesComponent;
	let fixture: ComponentFixture<SectionProformaInvoicesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SectionProformaInvoicesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SectionProformaInvoicesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
