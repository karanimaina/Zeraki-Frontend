import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShopPaymentsComponent } from "./shop-payments.component";

describe("ShopPaymentsComponent", () => {
	let component: ShopPaymentsComponent;
	let fixture: ComponentFixture<ShopPaymentsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ShopPaymentsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ShopPaymentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
