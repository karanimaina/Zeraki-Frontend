import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeeStatusClosingDateComponent } from "./fee-status-closing-date.component";

describe("SectionFeeStatusClosingDateComponent", () => {
	let component: FeeStatusClosingDateComponent;
	let fixture: ComponentFixture<FeeStatusClosingDateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ FeeStatusClosingDateComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FeeStatusClosingDateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
