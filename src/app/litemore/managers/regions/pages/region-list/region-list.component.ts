import { Component, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import Swal from "sweetalert2";
import { Region } from "../../../../../@core/models/region/region";
import { PageInfo } from "src/app/@core/models/common/pagination";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";

@Component({
	selector: "app-region-list",
	templateUrl: "./region-list.component.html",
	styleUrls: ["./region-list.component.scss"]
})
export class RegionListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getRegionsStatus$: Observable<APIStatus | null> = this.regionsState.getRegionsStatus$;

	regions: Region[] = [];
	pageInfo?: PageInfo;

	dataSource: MatTableDataSource<Region> = new MatTableDataSource();

	searchForm = this.fb.group({
		searchTerm: [""],
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
    private currentCountryState: CurrentCountryState,
	) { }

	ngOnInit(): void {
		this.subscribeToRegions();
		this.subscribeToCurrentCountry();
	}

	private subscribeToRegions() {
		this.regionsState.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionsData) => {
				if (regionsData) {
					this.pageInfo = regionsData.pageInfo;
					this.dataSource = new MatTableDataSource(regionsData.regions);
				}
			},
			error: () => {
				this.toastService.error("Failed to load regions");
			},
		});
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (currentCountry) => {
				if (currentCountry)	this.fetchRegions(currentCountry.countryId);
			},
		});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.fetchRegions(this.currentCountryId);
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchRegions(this.currentCountryId);
	}

	private fetchRegions(countryId?: number, download = false, page = 1, ) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: page,
			name: this.searchTerm?.value,
			download,
		};

		this.regionsState.retrieveRegions(filters);
	}

	async confirmRegionDeletion(region: Region, index: number) {
		const title = this.translate.instant("litemore.managers.regions.pages.regionList.confirmRegionDeletion.title");
		const text = this.translate.instant("litemore.managers.regions.pages.regionList.confirmRegionDeletion.text",{
			region:region.name
		});

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("litemore.managers.regions.pages.regionList.confirmRegionDeletion.yes"),
			cancelButtonText: this.translate.instant("litemore.managers.regions.pages.regionList.confirmRegionDeletion.no"),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) {
			this.deleteRegion(region, index);
		}
	}

	private deleteRegion(region: Region, index: number) {
		this.litemoreService.deleteRegion(region.regionId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.dataSource.filteredData.splice(index, 1);
				this.toastService.success(res.response.message);
			},
			error: (error: any) => {
				console.error(error);
				this.toastService.error(this.translate.instant("litemore.managers.regions.pages.regionList.failedToDeleteRegion"));
			}
		});
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: () => {
				const msg = this.translate.instant("common.toastMessages.cacheCleared");
				this.toastService.success(msg);
			},
			error: () => {
				const msg = this.translate.instant("common.toastMessages.cacheClearedError");
				this.toastService.error(msg);
			}
		});
	}

	onPageChanged(page: number) {
		this.fetchRegions(this.currentCountryId, false, page);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}

