import { TestBed } from "@angular/core/testing";

import { BdevService } from "./bdev.service";

describe("BdevService", () => {
	let service: BdevService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BdevService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
