import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentAnalyticsTopNavComponent } from "./student-analytics-top-nav.component";

describe("StudentAnalyticsTopNavComponent", () => {
	let component: StudentAnalyticsTopNavComponent;
	let fixture: ComponentFixture<StudentAnalyticsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentAnalyticsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentAnalyticsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
