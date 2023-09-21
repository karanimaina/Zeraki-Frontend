import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionOldInvoicesComponent } from "./section-old-invoices.component";

describe("SectionOldInvoicesComponent", () => {
	let component: SectionOldInvoicesComponent;
	let fixture: ComponentFixture<SectionOldInvoicesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ SectionOldInvoicesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SectionOldInvoicesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
