import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentMicroPaymentsComponent } from "./student-micro-payments.component";

describe("StudentMicroPaymentsComponent", () => {
	let component: StudentMicroPaymentsComponent;
	let fixture: ComponentFixture<StudentMicroPaymentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentMicroPaymentsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentMicroPaymentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
