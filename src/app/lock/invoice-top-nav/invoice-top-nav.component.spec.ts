import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InvoiceTopNavComponent } from "./invoice-top-nav.component";

describe("InvoiceTopNavComponent", () => {
	let component: InvoiceTopNavComponent;
	let fixture: ComponentFixture<InvoiceTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ InvoiceTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(InvoiceTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
