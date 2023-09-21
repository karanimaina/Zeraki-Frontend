import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnalysisSubjectMeritListComponent } from "./analysis-subject-merit-list.component";

describe("AnalysisSubjectMeritListComponent", () => {
	let component: AnalysisSubjectMeritListComponent;
	let fixture: ComponentFixture<AnalysisSubjectMeritListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AnalysisSubjectMeritListComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnalysisSubjectMeritListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
