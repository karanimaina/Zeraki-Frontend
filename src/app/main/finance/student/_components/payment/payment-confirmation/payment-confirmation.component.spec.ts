import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PaymentConfirmationComponent } from "./payment-confirmation.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {Component} from "@angular/core";

describe("PaymentConfirmationComponent", () => {
	let component: TestPaymentConfirmationComponent;
	let fixture: ComponentFixture<TestPaymentConfirmationComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [
				PaymentConfirmationComponent,
				TestPaymentConfirmationComponent
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestPaymentConfirmationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	@Component({
		selector: "test-payment-confirmation",
		template: "<app-payment-confirmation [payment]='payment' [stkPayload]=\"stkPayload\"></app-payment-confirmation>"
	})
	class TestPaymentConfirmationComponent {
		payment = {
			stage: 1,
			paymentSource: "Mpesa",
			amount: 10,
			paymentTo: "Zeraki",
			phoneNumber: "254712345678",
			product: "ZERAKI_FINANCE",
		};
		stkPayload = {
			msisdn: "",
			accountCode: "13-School",
			amount: 10,
			apiKey: "",
			product: "Analytics",
		};
	}
});
