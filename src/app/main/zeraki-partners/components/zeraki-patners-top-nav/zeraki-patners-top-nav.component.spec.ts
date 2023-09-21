import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ZerakiPatnersTopNavComponent } from "./zeraki-patners-top-nav.component";

describe("ZerakiPatnersTopNavComponent", () => {
	let component: ZerakiPatnersTopNavComponent;
	let fixture: ComponentFixture<ZerakiPatnersTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ZerakiPatnersTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ZerakiPatnersTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
