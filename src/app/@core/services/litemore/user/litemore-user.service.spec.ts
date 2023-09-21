import { TestBed } from "@angular/core/testing";

import { LitemoreUserService } from "./litemore-user.service";

describe("LitemoreUserService", () => {
	let service: LitemoreUserService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(LitemoreUserService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
