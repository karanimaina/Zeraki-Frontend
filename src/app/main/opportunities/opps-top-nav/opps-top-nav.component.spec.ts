import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OppsTopNavComponent } from "./opps-top-nav.component";

describe("OppsTopNavComponent", () => {
	let component: OppsTopNavComponent;
	let fixture: ComponentFixture<OppsTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ OppsTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(OppsTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
