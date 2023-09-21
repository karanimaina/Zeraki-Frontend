import { TestBed } from "@angular/core/testing";

import { AuthRefreshInterceptor } from "./auth-refresh.interceptor";

describe("AuthRefreshInterceptor", () => {
	beforeEach(() => TestBed.configureTestingModule({
		providers: [
			AuthRefreshInterceptor
		]
	}));

	it("should be created", () => {
		const interceptor: AuthRefreshInterceptor = TestBed.inject(AuthRefreshInterceptor);
		expect(interceptor).toBeTruthy();
	});
});
