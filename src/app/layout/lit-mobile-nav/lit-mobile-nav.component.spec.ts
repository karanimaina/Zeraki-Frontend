import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LitMobileNavComponent } from "./lit-mobile-nav.component";

describe("LitMobileNavComponent", () => {
	let component: LitMobileNavComponent;
	let fixture: ComponentFixture<LitMobileNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LitMobileNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LitMobileNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
