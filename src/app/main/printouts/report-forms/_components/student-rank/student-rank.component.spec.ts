import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentRankComponent } from "./student-rank.component";

describe("SectionStudentRankComponent", () => {
	let component: StudentRankComponent;
	let fixture: ComponentFixture<StudentRankComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentRankComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentRankComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
