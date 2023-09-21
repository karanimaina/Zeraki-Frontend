import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentMessagesComponent } from "./student-messages.component";

describe("StudentMessagesComponent", () => {
	let component: StudentMessagesComponent;
	let fixture: ComponentFixture<StudentMessagesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ StudentMessagesComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentMessagesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
