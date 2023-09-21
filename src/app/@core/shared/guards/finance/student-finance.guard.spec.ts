import { TestBed } from "@angular/core/testing";

import { StudentFinanceGuard } from "./student-finance.guard";

describe("StudentFinanceGuard", () => {
	let guard: StudentFinanceGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(StudentFinanceGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
