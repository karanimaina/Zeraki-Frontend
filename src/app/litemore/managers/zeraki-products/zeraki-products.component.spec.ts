import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ZerakiProductsComponent } from "./zeraki-products.component";

describe("ZerakiProductsComponent", () => {
	let component: ZerakiProductsComponent;
	let fixture: ComponentFixture<ZerakiProductsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ZerakiProductsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ZerakiProductsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
