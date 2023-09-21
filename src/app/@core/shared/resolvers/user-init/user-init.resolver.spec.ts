import { TestBed } from "@angular/core/testing";

import { UserInitResolver } from "./user-init.resolver";

describe("UserInitResolver", () => {
	let resolver: UserInitResolver;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		resolver = TestBed.inject(UserInitResolver);
	});

	it("should be created", () => {
		expect(resolver).toBeTruthy();
	});
});
