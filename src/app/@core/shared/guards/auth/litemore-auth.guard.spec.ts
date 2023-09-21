import { TestBed } from "@angular/core/testing";

import { LitemoreAuthGuard } from "./litemore-auth.guard";

describe("LitemoreAuthGuard", () => {
	let guard: LitemoreAuthGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(LitemoreAuthGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
