import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InvoiceCollectionsComponent } from "./invoice-collections.component";

describe("InvoiceCollectionsComponent", () => {
	let component: InvoiceCollectionsComponent;
	let fixture: ComponentFixture<InvoiceCollectionsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ InvoiceCollectionsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(InvoiceCollectionsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
