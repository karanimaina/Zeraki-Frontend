import { TestBed } from "@angular/core/testing";

import { AccountActiveGuard } from "./account-active.guard";

describe("AccountActiveGuard", () => {
	let guard: AccountActiveGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(AccountActiveGuard);
	});

	it("should be created", () => {
		expect(guard).toBeTruthy();
	});
});
