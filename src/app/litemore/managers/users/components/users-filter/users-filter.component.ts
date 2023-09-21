import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import { RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { Region, RegionsData } from "src/app/@core/models/region/region";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import RolesState from "src/app/@core/services/litemore/states/roles.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "src/app/@core/enums/api-status";
import { County } from "src/app/@core/models/country/county/county";

@Component({
	selector: "app-users-filter",
	templateUrl: "./users-filter.component.html",
	styleUrls: ["./users-filter.component.scss"]
})
export class UsersFilterComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;

	@Input() userSearchTerm?: string;

	destroy$: Subject<boolean> = new Subject<boolean>();

	getRegionsStatus$: Observable<APIStatus | null> = this.regionsState.getRegionsStatus$;
	regions$: Observable<RegionsData | null> = this.regionsState.regions$;

	getRegionCountiesStatus$ = this.regionCountiesState.getRegionCountiesStatus$;
	roles$ = this.rolesState.roles$;
	getRolesStatus$ = this.rolesState.getRolesStatus$;

	regions: Region[] = [];
	countryCounties: County[] = [];
	counties: County[] = [];

	filterForm = new SubmitFormGroup({
		selectedRegion: new FormControl(null),
		selectedCounty: new FormControl(null),
		selectedRole: new FormControl(null),
	});
	get selectedRegion() {
		return this.filterForm.get("selectedRegion");
	}
	get selectedCounty() {
		return this.filterForm.get("selectedCounty");
	}
	get selectedRole() {
		return this.filterForm.get("selectedRole");
	}

	constructor(
		private litemoreService: LitemoreService,
		private usersListState: UsersListState,
		private regionsState: RegionsState,
		private regionCountiesState: RegionCountiesState,
		private currentCountryState: CurrentCountryState,
		private rolesState: RolesState,
		private errorHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.subscribeToRegions();
		this.subscribeToCounties();
		this.rolesState.retrieveRoles();
	}

	private subscribeToRegions() {
		this.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: regionsData => {
				this.selectedRegion?.reset();
				if (regionsData)	this.regions = regionsData.regions;
			},
			error: (err: any) => {
				this.errorHandler.error(err, "subscribeToRegions()");
			},
		});
	}

	private subscribeToCounties() {
		this.regionCountiesState.regionCounties$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionCountiesData) => {
				this.counties = regionCountiesData?.counties || [];
			},
		});
	}

	onRegionChange(region?: Region) {
		this.selectedCounty?.reset();
		this.counties = [];

		if (region) {
			this.fetchCounties(region.regionId);
		} else {
			this.fetchCounties();
		}
	}

	private fetchCounties(regionId?: number) {
		const params: any = {
			countryId: this.currentCountryState.currentCountryId,
			download: true,
		};
		if (regionId) params.regionId = regionId;
		this.regionCountiesState.retrieveRegionCounties(params);
	}

	onFilterFormSubmit() {
		const filters: RetrieveInternalViewsUsersFilters = {
			regionId: this.selectedRegion?.value,
			countyId: this.selectedCounty?.value,
			role: this.selectedRole?.value,
			countryId: this.currentCountryState.getCurrentCountry()?.countryId
		};

		this.usersListState.retrieveUsersList(filters);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
