import { TestBed } from "@angular/core/testing";

import { LitemoreGuard } from "./litemore.guard";

describe("LitemoreGuard", () => {
	let guard: LitemoreGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(LitemoreGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
