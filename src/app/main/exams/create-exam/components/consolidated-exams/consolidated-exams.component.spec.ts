import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ConsolidatedExamsComponent } from "./consolidated-exams.component";

describe("ConsolidatedExamsComponent", () => {
	let component: ConsolidatedExamsComponent;
	let fixture: ComponentFixture<ConsolidatedExamsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ConsolidatedExamsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConsolidatedExamsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
