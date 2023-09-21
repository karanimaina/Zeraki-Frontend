import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BomTopNavComponent } from "./bom-top-nav.component";

describe("BomTopNavComponent", () => {
	let component: BomTopNavComponent;
	let fixture: ComponentFixture<BomTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ BomTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BomTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
