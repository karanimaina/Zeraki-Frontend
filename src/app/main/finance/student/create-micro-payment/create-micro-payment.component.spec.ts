import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateMicroPaymentComponent } from "./create-micro-payment.component";

describe("CreateMicroPaymentComponent", () => {
	let component: CreateMicroPaymentComponent;
	let fixture: ComponentFixture<CreateMicroPaymentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateMicroPaymentComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateMicroPaymentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
