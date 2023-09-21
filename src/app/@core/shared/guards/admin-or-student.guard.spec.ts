import { TestBed } from "@angular/core/testing";

import { AdminOrStudentGuard } from "./admin-or-student.guard";

describe("AdminOrStudentGuard", () => {
	let guard: AdminOrStudentGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(AdminOrStudentGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
