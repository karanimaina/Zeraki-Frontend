import { TestBed } from "@angular/core/testing";

import { UnlockGuard } from "./unlock.guard";

describe("UnlockGuard", () => {
	let guard: UnlockGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(UnlockGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
