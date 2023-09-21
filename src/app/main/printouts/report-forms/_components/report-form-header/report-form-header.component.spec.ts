import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ReportFormHeaderComponent } from "./report-form-header.component";

describe("SectionReportFormHeaderComponent", () => {
	let component: ReportFormHeaderComponent;
	let fixture: ComponentFixture<ReportFormHeaderComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ReportFormHeaderComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ReportFormHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
