import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentAnalyticsSubjectComponent } from "./student-analytics-subject.component";

describe("StudentAnalyticsSubjectComponent", () => {
	let component: StudentAnalyticsSubjectComponent;
	let fixture: ComponentFixture<StudentAnalyticsSubjectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentAnalyticsSubjectComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentAnalyticsSubjectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
