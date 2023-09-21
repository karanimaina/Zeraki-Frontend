import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentTimelinePerformanceComponent } from "./student-timeline-performance.component";

describe("SectionStudentTimelinePerformanceComponent", () => {
	let component: StudentTimelinePerformanceComponent;
	let fixture: ComponentFixture<StudentTimelinePerformanceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentTimelinePerformanceComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentTimelinePerformanceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
