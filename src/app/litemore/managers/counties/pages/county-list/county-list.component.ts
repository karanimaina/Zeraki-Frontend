import { Component, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { PageInfo } from "src/app/@core/models/common/pagination";
import { County } from "src/app/@core/models/country/county/county";
import { RetrieveRegionCountyFilters } from "src/app/@core/models/country/county/payload";
import { Region } from "src/app/@core/models/region/region";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-county-list",
	templateUrl: "./county-list.component.html",
	styleUrls: ["./county-list.component.scss"]
})
export class CountyListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getRegionsStatus$: Observable<APIStatus | null> =
		this.regionsState.getRegionsStatus$;
	regions: Region[] = [];

	getRegionCountiesStatus$: Observable<APIStatus | null> =
		this.regionCountiesState.getRegionCountiesStatus$;
	dataSource: MatTableDataSource<County> = new MatTableDataSource();
	pageInfo?: PageInfo;
	regionFilter?: number;

	searchForm = this.fb.group({
		searchTerm: [""]
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	get currentCountryId(): number | undefined {
		return this.currentCountryState.getCurrentCountry()?.countryId;
	}

	constructor(
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private fb: FormBuilder,
		private regionsState: RegionsState,
		private regionCountiesState: RegionCountiesState,
		private currentCountryState: CurrentCountryState,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnInit(): void {
		this.subscribeToCurrentCountry();
		this.subscribeToRegions();
		this.subscribeToRegionCounties();
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (currentCountry) => {
					if (currentCountry) this.fetchCounties(currentCountry.countryId);
				}
			});
	}

	private subscribeToRegions() {
		this.regionsState.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionsData) => {
				if (regionsData) this.regions = regionsData.regions;
			},
			error: () => {
				this.toastService.error(
					this.translate.instant(
						"litemore.managers.counties.pages.countyList.failedtoLoadRegions"
					)
				);
			}
		});
	}

	private subscribeToRegionCounties() {
		this.regionCountiesState.regionCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (regionCountiesData) => {
					if (regionCountiesData) {
						this.pageInfo = regionCountiesData.pageInfo;
						this.dataSource = new MatTableDataSource(
							regionCountiesData.counties
						);
					}
				},
				error: () => {
					this.toastService.error(
						this.translate.instant(
							"litemore.managers.counties.pages.countyList.failedtoLoadCountries"
						)
					);
				}
			});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.fetchCounties(<number>this.currentCountryId);
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchCounties(<number>this.currentCountryId);
	}

	private fetchCounties(countryId: number, page = 1) {
		const filters: RetrieveRegionCountyFilters = {
			currentPage: page,
			countryId,
			regionId: this.regionFilter,
			name: this.searchTerm?.value
		};

		this.regionCountiesState.retrieveRegionCounties(filters);
	}

	async confirmCountyDeletion(county: County, index: number) {
		const title = this.translate.instant(
			"litemore.managers.counties.pages.countyList.confirmDeletion.title"
		);
		const text = this.translate.instant(
			"litemore.managers.counties.pages.countyList.confirmDeletion.text",
			{
				county: county.name
			}
		);

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.managers.counties.pages.countyList.confirmDeletion.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.managers.counties.pages.countyList.confirmDeletion.no"
			),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false
		});

		if (result.isConfirmed) {
			this.deleteCounty(county, index);
		}
	}

	private deleteCounty(county: County, index: number) {
		this.litemoreService
			.deleteCounty(county.countyId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.dataSource.filteredData.splice(index, 1);
					this.responseHandler.success(res);
				},
				error: (error: any) => {
					console.error(error);
					this.toastService.error(
						this.translate.instant(
							"litemore.managers.counties.pages.countyList.failedToDeleteCounty"
						)
					);
				}
			});
	}

	clearCache() {
		this.litemoreService
			.clearCache()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					const msg = this.translate.instant(
						"common.toastMessages.cacheCleared"
					);
					this.toastService.success(msg);
				},
				error: () => {
					const msg = this.translate.instant(
						"common.toastMessages.cacheClearedError"
					);
					this.toastService.error(msg);
				}
			});
	}

	onPageChanged(page: number) {
		this.fetchCounties(<number>this.currentCountryId, page);
	}

	onRegionFilterChange(regionId?: number) {
		this.regionFilter = regionId;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
