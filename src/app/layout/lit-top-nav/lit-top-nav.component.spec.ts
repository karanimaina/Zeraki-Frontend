import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LitTopNavComponent } from "./lit-top-nav.component";

describe("LitTopNavComponent", () => {
	let component: LitTopNavComponent;
	let fixture: ComponentFixture<LitTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LitTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LitTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
