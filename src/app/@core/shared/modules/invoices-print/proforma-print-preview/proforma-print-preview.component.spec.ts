import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProformaPrintPreviewComponent } from "./proforma-print-preview.component";

describe("ProformaPrintPreviewComponent", () => {
	let component: ProformaPrintPreviewComponent;
	let fixture: ComponentFixture<ProformaPrintPreviewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ProformaPrintPreviewComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ProformaPrintPreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
