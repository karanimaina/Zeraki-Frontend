import { TestBed } from "@angular/core/testing";

import { OnlyTeacherGuard } from "./only-teacher.guard";

describe("OnlyTeacherGuard", () => {
	let guard: OnlyTeacherGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(OnlyTeacherGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
