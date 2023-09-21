import { TestBed } from "@angular/core/testing";

import { CteacherOrAdminGuard } from "./cteacher-or-admin.guard";

describe("CteacherOrAdminGuard", () => {
	let guard: CteacherOrAdminGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(CteacherOrAdminGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
