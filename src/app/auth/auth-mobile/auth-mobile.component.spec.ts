import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthMobileComponent } from "./auth-mobile.component";

describe("AuthMobileComponent", () => {
	let component: AuthMobileComponent;
	let fixture: ComponentFixture<AuthMobileComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ AuthMobileComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AuthMobileComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
