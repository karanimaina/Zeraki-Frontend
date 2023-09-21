import { TestBed } from "@angular/core/testing";

import { PrintoutsService } from "./printouts.service";

describe("PrintoutsService", () => {
	let service: PrintoutsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PrintoutsService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
