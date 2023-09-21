import { TestBed } from "@angular/core/testing";

import { NotStudentGuard } from "./not-student.guard";

describe("NotStudentGuard", () => {
	let guard: NotStudentGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(NotStudentGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
