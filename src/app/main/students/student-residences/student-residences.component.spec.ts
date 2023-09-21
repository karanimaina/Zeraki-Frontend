import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentResidencesComponent } from "./student-residences.component";

describe("StudentResidencesComponent", () => {
	let component: StudentResidencesComponent;
	let fixture: ComponentFixture<StudentResidencesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentResidencesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentResidencesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
