import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnalysisSubjectComponent } from "./analysis-subject.component";

describe("AnalysisSubjectComponent", () => {
	let component: AnalysisSubjectComponent;
	let fixture: ComponentFixture<AnalysisSubjectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AnalysisSubjectComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnalysisSubjectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
