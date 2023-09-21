import { Component, OnDestroy, OnInit } from "@angular/core";
import { APIStatus } from "../../../../@core/enums/api-status";
import { StepperOrientation } from "@angular/material/stepper";
import { ActivatedRoute, Router } from "@angular/router";
import { LitemoreService } from "../../../../@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "../../../../@core/shared/services/response-handler/response-handler.service";
import CountryDivisionsState from "../../../../@core/services/litemore/states/country-divisions.state";
import { Observable, Subject } from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { finalize, map, takeUntil } from "rxjs/operators";

@Component({
	selector: "app-country-update",
	templateUrl: "./country-update.component.html",
	styleUrls: ["./country-update.component.scss"]
})
export class CountryUpdateComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();
	stepperOrientation$!: Observable<StepperOrientation>;
	getCountryDivisionsStatus$!: Observable<any>;
	countryDivisions$!: Observable<any>;

	readonly APIStatus = APIStatus;
	countryDetails: any;
	country: any;
	companyDetails: any;
	paymentDetails: any;
	postData: any = {};
	countryId!: number;
	isLoadingCountryDetails = true;
	isUpdatingCountry = false;
	countryDetailsUpdated = false;
	companyDetailsUpdated = false;

	constructor(
		private router: Router,
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private countryDivisionsState: CountryDivisionsState,
		private activatedRoute: ActivatedRoute,
		breakpointObserver: BreakpointObserver
	) {
		this.stepperOrientation$ = breakpointObserver
			.observe("(min-width: 800px)")
			.pipe(map(({ matches }) => (matches ? "horizontal" : "vertical")));

	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getCountryDivisionsStatus$ = this.countryDivisionsState.getCountryDivisionsStatus$;
		this.countryDivisions$ = this.countryDivisionsState.countryDivisions$;
		this.countryId = this.activatedRoute.snapshot.params.id;
		this.loadCountryDetails();
	}

	/**
	 *
	 * Country details
	 * {
	 *         "countryId": 1,
	 *         "name": "Kenya",
	 *         "countryCode": 254,
	 *         "division": "County",
	 *         "paymentInformation": {
	 *             "vatRate": 0.0,
	 *             "currency": "KSH",
	 *             "accountName": null,
	 *             "accountNumber": null,
	 *             "bankName": null,
	 *             "taxPin": "P051523925C",
	 *             "taxTitle": null
	 *         },
	 *         "companyInformation": {
	 *             "name": "Litemore Limited",
	 *             "address": "P.O. Box 51235-00100",
	 *             "email": "info@litemore.co.ke",
	 *             "phone": null,
	 *             "city": "Nairobi, Kenya"
	 *         }
	 *     }
	 */
	loadCountryDetails() {
		this.isLoadingCountryDetails = true;
		this.litemoreService.getCountryById(this.countryId)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingCountryDetails = false))
			.subscribe((countryDetails) => {
				this.countryDetails = countryDetails[0];
				const country = countryDetails[0];
				this.country = {
					id: country.countryId,
					name: country.name,
					division: country.division,
					countryCode: country.countryCode
				};

				this.companyDetails = country.companyInformation;
				this.paymentDetails = country.paymentInformation;
			}, (error) => {
				this.responseHandler.error(error, "loadCountryDetails()");
			});

	}

	back() {
		this.router.navigate(["/litemore/mg/countries"]);
	}

	onUpdateCountrySubmit(event) {
		this.postData = {
			...this.postData, ...event
		};
		this.countryDetailsUpdated = true;
	}

	onUpdateCompanyDetailsSubmit(event) {
		if (event.formHasValue) {
			this.postData.companyInformation = event.data;
		}
		this.companyDetailsUpdated = true;
	}

	onUpdatePaymentDetailsSubmit(event) {
		if (event.formHasValue) {
			event.data.taxTitle = event.data.taxPinTitle;
			this.postData.paymentInformation = event.data;
		}
		this.postData = {
			...this.postData,
			countryId: Number(this.countryId)
		};
		this.updateCountry();
	}

	updateCountry() {
		this.isUpdatingCountry = true;
		this.litemoreService.updateCountryProfile(this.postData)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isUpdatingCountry = false))
			.subscribe({
				next: (res) => {
					this.responseHandler.success(res);
					this.back();
				},
				error: (err) => {
					this.responseHandler.error(err, "updateCountry()");
				}
			});
	}

}
