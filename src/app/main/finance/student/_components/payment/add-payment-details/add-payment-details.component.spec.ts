import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AddPaymentDetailsComponent } from "./add-payment-details.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Micropayment} from "../../../../../../@core/models/finance/micropayment";

describe("AddPaymentDetailsComponent", () => {
	let component: AddPaymentDetailsComponent;
	let fixture: ComponentFixture<AddPaymentDetailsComponent>;
	const payment: Micropayment = {
		paymentSource : "Mpesa",
		amount : 10,
		paymentTo : "Zeraki",
		phoneNumber : "254712345678",
		product : "ZERAKI_FINANCE",
		stage : 1
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot(),
				RouterTestingModule.withRoutes([])
			],
			declarations: [ AddPaymentDetailsComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddPaymentDetailsComponent);
		component = fixture.componentInstance;
		component.payment = payment;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
