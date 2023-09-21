import { TestBed } from "@angular/core/testing";

import { BomPaService } from "./bom-pa.service";

describe("BomPaService", () => {
	let service: BomPaService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BomPaService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
