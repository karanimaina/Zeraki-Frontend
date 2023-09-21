import { TestBed } from "@angular/core/testing";

import { LitemoreService } from "./litemore.service";

describe("LitemoreService", () => {
	let service: LitemoreService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(LitemoreService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
