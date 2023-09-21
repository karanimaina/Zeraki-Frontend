import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShopTopNavComponent } from "./shop-top-nav.component";

describe("ShopTopNavComponent", () => {
	let component: ShopTopNavComponent;
	let fixture: ComponentFixture<ShopTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ShopTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShopTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
