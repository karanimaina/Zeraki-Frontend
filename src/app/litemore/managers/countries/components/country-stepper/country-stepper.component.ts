import { BreakpointObserver } from "@angular/cdk/layout";
import { StepperOrientation } from "@angular/cdk/stepper";
import { Location } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material/stepper";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";

@Component({
	selector: "app-country-stepper",
	templateUrl: "./country-stepper.component.html",
	styleUrls: ["./country-stepper.component.scss"]
})
export class CountryStepperComponent implements OnInit {
	@Input() isUpdating = false;
	@Input() completedStep1 = false;
	@Input() completedStep2 = false;
	@Input() isAddingCountry = false;
	@Input() companyDetails: any;
	@Input() country: any;
	@Input() paymentDetails: any;


	@Input() countryDivisions$!: Observable<any>;
	@Input() getCountryDivisionsStatus$!: Observable<any>;

	@Output() addCompanyDetailsEvt = new EventEmitter<any>();
	@Output() addCountryEvt = new EventEmitter<any>();
	@Output() paymentDetailsEvt = new EventEmitter<any>();



	@ViewChild("stepper") private myStepper!: MatStepper;

	stepperOrientation$!: Observable<StepperOrientation>;

	readonly APIStatus = APIStatus;

	constructor(
		private location: Location,
		breakpointObserver: BreakpointObserver
	) {
		this.stepperOrientation$ = breakpointObserver
			.observe("(min-width: 800px)")
			.pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));

	}

	ngOnInit(): void { }

	handleCountryEvt(event: any) {
		this.addCountryEvt.emit(event);
		this.nextStep();
	}

	handleCompanyDetailsEvt(event: any) {
		this.addCompanyDetailsEvt.emit(event);
		this.nextStep();
	}

	handlePaymentDetailsEvt(event: any) {
		this.paymentDetailsEvt.emit(event);
	}

	nextStep() {
		this.myStepper.next();
	}

	back() {
		this.location.back();
	}

}
