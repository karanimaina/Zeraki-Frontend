import {
	Component,
	OnInit,
	OnDestroy,
	Input,
	Output,
	EventEmitter
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { RetrieveRegionCountyFilters } from "src/app/@core/models/country/county/payload";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";
import { Region, RegionsData } from "src/app/@core/models/region/region";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-counties-filters",
	templateUrl: "./counties-filters.component.html",
	styleUrls: ["./counties-filters.component.scss"]
})
export class CountiesFiltersComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	@Input() countyNameSearchTerm?: string;
	@Input() countryId?: number;

	@Output() onRegionFilterChange = new EventEmitter<number>();

	getRegionsStatus$: Observable<APIStatus | null> =
		this.regionsState.getRegionsStatus$;
	regions$: Observable<RegionsData | null> = this.regionsState.regions$;

	regions: Region[] = [];

	filterForm = new SubmitFormGroup({
		selectedRegion: new FormControl(null)
	});

	get selectedRegion() {
		return this.filterForm.get("selectedRegion");
	}

	constructor(
		private regionsState: RegionsState,
		private currentCountryState: CurrentCountryState,
		private regionCountiesState: RegionCountiesState,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnInit(): void {
		this.subscribeToRegions();
		this.subscribeToCurrentCountry();
	}

	private subscribeToRegions() {
		this.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionsData) => {
				this.selectedRegion?.reset();
				if (regionsData) this.regions = regionsData.regions;
			},
			error: (err: any) => {
				this.responseHandler.error(err, "subscribeToRegions()");
			}
		});
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (currentCountry) => {
					if (currentCountry) this.getRegions(currentCountry.countryId);
				}
			});
	}

	private getRegions(countryId?: number) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: 1,
			download: true // to retrieve all regions without pagination restrictions
		};

		this.regionsState.retrieveRegions(filters);
	}

	onRegionChange(region?: Region) {
		this.onRegionFilterChange.emit(region?.regionId);
		this.getCounties(1, <number>this.countryId, region?.regionId);
	}

	getCounties(
		page = 1,
		countryId: number,
		regionId?: number,
		download = false
	) {
		const filters: RetrieveRegionCountyFilters = {
			currentPage: page,
			countryId,
			regionId,
			download
		};

		this.regionCountiesState.retrieveRegionCounties(filters);
	}

	onFilterFormSubmit() {
		this.getCounties(1, <number>this.countryId, this.selectedRegion?.value);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
