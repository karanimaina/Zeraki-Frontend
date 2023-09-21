import { TestBed } from "@angular/core/testing";

import { SchoolTypeMappingService } from "./school-type-mapping.service";

describe("SchoolTypeMappingService", () => {
	let service: SchoolTypeMappingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SchoolTypeMappingService);
	});

	it("should be created", () => {
		expect(service).toBeTruthy();
	});
});
