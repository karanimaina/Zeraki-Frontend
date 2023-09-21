import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import CountryDetailsState from "src/app/@core/services/litemore/states/country-details.state";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { TopNavComponent } from "../top-nav/top-nav.component";
import CountryProfilesState from "src/app/@core/services/litemore/states/country-profiles.state";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { CountryProfile } from "src/app/@core/models/country/country-profile";

@Component({
	selector: "app-lit-top-nav",
	templateUrl: "./lit-top-nav.component.html",
	styleUrls: ["./lit-top-nav.component.scss"]
})
export class LitTopNavComponent
	extends TopNavComponent
	implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	litemoreUser$ = this.litemoreUserService.litemoreUser$;

	readonly LitemoreUserRole = LitemoreUserRole;

	countries: CountryProfile[] = [];
	activeCountry: CountryProfile | null = null;

	constructor(
		siteLanguageService: SiteLanguageService,
		dataService: DataService,
		authService: AuthService,
		userService: UserService,
		summaryService: SummaryService,
		toastService: HotToastService,
		messagingService: MessagingService,
		financeService: FinanceService,
		router: Router,
		rolesService: RolesService,
		translate: TranslateService,
		responseHandler: ResponseHandlerService,
		private litemoreUserService: LitemoreUserService,
		private litemoreService: LitemoreService,
		private toast: HotToastService,
		private currentCountryState: CurrentCountryState,
		private countryDetailsState: CountryDetailsState,
		private countryProfilesState: CountryProfilesState
	) {
		super(
			siteLanguageService,
			dataService,
			authService,
			userService,
			summaryService,
			toastService,
			messagingService,
			financeService,
			router,
			rolesService,
			translate,
			responseHandler
		);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this.subscribeToLitemoreUser();
		this.subscribeToCountryProfiles();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private subscribeToCountryProfiles() {
		this.countryProfilesState.countryProfiles$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (countries) => {
					if (countries) {
						this.countries = countries;

						const loggedInUserCountry = countries.find(
							(country) =>
								country.countryId === this.loggedInLitemoreUser?.countryId
						);
						if (loggedInUserCountry) {
							this.activeCountry = loggedInUserCountry;
						} else {
							this.activeCountry = this.countries[0];
						}

						this.currentCountryState.changeCurrentCountry(this.activeCountry);
					}
				}
			});
	}

	private subscribeToLitemoreUser() {
		this.litemoreUserService.litemoreUserObs$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (litemoreUser) => {
					if (litemoreUser) {
						this.loggedInLitemoreUser = litemoreUser;
						this.loadCountries();
					}
				}
			});
	}

	private loadCountries() {
		this.countryProfilesState.retrieveCountryProfiles();
	}

	private getCountryDetails() {
		this.countryDetailsState.retrieveCountryDetails(
			<number>this.currentCountryState.getCurrentCountry()?.countryId
		);
	}

	switchCountry(countryId: number) {
		const foundCountry = this.countries.find(
			(country) => country.countryId === countryId
		);

		if (
			foundCountry &&
			foundCountry.countryId !== this.activeCountry?.countryId
		) {
			this.activeCountry = foundCountry;
			this.currentCountryState.changeCurrentCountry(this.activeCountry);

			this.getCountryDetails();
		}
	}

	clearCache() {
		this.litemoreService
			.clearCache()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				complete: () => {
					this.toast.success("Cache Cleared");
				}
			});
	}
}
