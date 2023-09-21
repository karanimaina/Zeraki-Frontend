import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MoveStudentComponent } from "./move-student.component";

describe("MoveStudentComponent", () => {
	let component: MoveStudentComponent;
	let fixture: ComponentFixture<MoveStudentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ MoveStudentComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MoveStudentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
