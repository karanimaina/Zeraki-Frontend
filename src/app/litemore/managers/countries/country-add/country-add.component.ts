import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { LitemoreService } from "../../../../@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "../../../../@core/shared/services/response-handler/response-handler.service";
import CountryDivisionsState from "../../../../@core/services/litemore/states/country-divisions.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { StepperOrientation } from "@angular/material/stepper";
import { finalize, map, takeUntil } from "rxjs/operators";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
	selector: "app-country-add",
	templateUrl: "./country-add.component.html",
	styleUrls: ["./country-add.component.scss"]
})
export class CountryAddComponent implements OnInit {

	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();
	stepperOrientation$!: Observable<StepperOrientation>;


	countrySaved = false;
	companyDetailsSaved = false;

	getCountryDivisionsStatus$ = this.countryDivisionsState.getCountryDivisionsStatus$;
	countryDivisions$ = this.countryDivisionsState.countryDivisions$;

	isAddingCountry = false;

	countryPayload: any = {};


	constructor(
		private location: Location,
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private countryDivisionsState: CountryDivisionsState,
		breakpointObserver: BreakpointObserver
	) {
		this.stepperOrientation$ = breakpointObserver
			.observe("(min-width: 800px)")
			.pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));

	}

	ngOnInit(): void { }

	onAddCountrySubmit(event: any) {
		const payload = event;
		this.countryPayload = { ...this.countryPayload, ...payload };
	}


	onAddCompanyDetailsSubmit(event) {
		const payload = event;
		if (payload.formHasValue) {
			this.countryPayload.companyInformation = payload.data;
		}
		this.companyDetailsSaved = true;
	}

	onAddPaymentDetails(event) {
		const payload = event;
		if (payload.formHasValue) {
			this.countryPayload.paymentInformation = payload.data;
		}
		this.saveCountry();
	}

	saveCountry() {
		this.isAddingCountry = true;
		this.litemoreService.addCountryProfile(this.countryPayload)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isAddingCountry = false)
			)
			.subscribe({
				next: (res: any) => {
					this.responseHandler.success(res);
					this.countrySaved = true;
					this.back();
				},
				error: (err: any) => {
					this.responseHandler.error(err, "onAddCountrySubmit()");
				},
			});
	}

	back() {
		this.location.back();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
