import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ResidenceStudentBehaviourComponent } from "./residence-student-behaviour.component";

describe("ResidenceStudentBehaviourComponent", () => {
	let component: ResidenceStudentBehaviourComponent;
	let fixture: ComponentFixture<ResidenceStudentBehaviourComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ResidenceStudentBehaviourComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ResidenceStudentBehaviourComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
