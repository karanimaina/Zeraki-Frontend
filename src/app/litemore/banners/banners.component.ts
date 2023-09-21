import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { LitemoreBanner } from "src/app/@core/models/banners/litemore-banner";
import { PageInfo } from "src/app/@core/models/common/pagination";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { BannerService } from "src/app/@core/services/banner/banner.service";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-banners",
	templateUrl: "./banners.component.html",
	styleUrls: ["./banners.component.scss"]
})
export class BannersComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	isLoadingCountries = false;
	allCountries: Array<CountryProfile> = [];

	searchForm = this.fb.group({
		searchTerm: [""],
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	isLoadingBanners = false;
	dataSource: MatTableDataSource<LitemoreBanner> = new MatTableDataSource();
	pageInfo?: PageInfo;
	itemsPerPage = 10;

	isDeletingBanner = false;
	bannerIndexDeleted = -1;

	selectedBanner: LitemoreBanner | null = null;

	constructor(
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private fb: FormBuilder,
		private bannerService: BannerService,
	) { }

	ngOnInit(): void {
		this.getAllCountries();
		this.getBanners();
	}

	private getAllCountries() {
		this.isLoadingCountries = true;

		this.litemoreService.getCountryProfiles()
			.pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingCountries = false))
			.subscribe({
				next: (resp) => this.allCountries = resp,
				error: (err) => this.responseHandler.error(err, "getAllCountries()"),
			});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.getBanners();
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.getBanners();
	}

	private getBanners(page = 1, pageSize = this.itemsPerPage) {
		this.isLoadingBanners = true;

		this.bannerService.getLitemoreBanners(this.searchTerm?.value, page, pageSize)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingBanners = false))
			.subscribe({
				next: (resp) => {
					this.dataSource = new MatTableDataSource(resp.banners);
					this.pageInfo = resp.pageInfo;
				},
			});
	}

	onPageChanged(page: number) {
		this.getBanners(page);
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => this.responseHandler.success(resp, "clearCache()"),
			error: (err) =>	this.responseHandler.error(err, "clearCache()"),
		});
	}

	onBannerAdditionSuccess() {
		this.getBanners();
	}

	onBannerUpdateSuccess() {
		this.getBanners();
	}

	async confirmBannerDeletion(banner: LitemoreBanner, index: number) {
		const title = this.translate.instant("litemore.banners.deleteSwal.title");
		const text = this.translate.instant("litemore.banners.deleteSwal.text", { title:banner.title });

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) this.deleteBanner(banner, index);
	}

	private deleteBanner(banner: LitemoreBanner, index: number) {
		this.isDeletingBanner = true;
		this.bannerIndexDeleted = index;

		this.bannerService.deleteBanners(banner.bannerId)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isDeletingBanner = false;
					this.bannerIndexDeleted = -1;
				}),
			)
			.subscribe({
				next: (resp) => {
					this.removeBannerFromList(index);
					this.responseHandler.success(resp, "deleteBanner()");
				},
				error: (err) => this.responseHandler.error(err, "deleteBanner()"),
			});
	}

	private removeBannerFromList(index: number) {
		this.dataSource.filteredData.splice(index, 1);
	}

	setSelectedBanner(banner: LitemoreBanner) {
		this.selectedBanner = banner;
	}

	closeBannerImagesSection() {
		this.selectedBanner = null;
	}

	targetDevice: "desktop" | "tablet" | "mobile" = "desktop";

	onFileSelected(event: any, targetDevice: "desktop" | "tablet" | "mobile") {
		this.targetDevice = targetDevice;

		const file: File = event.target.files[0];

		const bannerDetails = {
			title: this.selectedBanner?.title,
			startDate: this.selectedBanner?.startDate,
			endDate: this.selectedBanner?.endDate,
			countries: this.selectedBanner?.showInCountries.map(item => item.countryId),
			targetUsers: this.selectedBanner?.targetUsers,
			bannerStatus: this.selectedBanner?.bannerStatus,
			bannerId: this.selectedBanner?.bannerId,
		};

		const formData = new FormData();
		formData.append("bannerDetails", JSON.stringify(bannerDetails));
		formData.append(`${targetDevice}File`, file);

		this.updateBanner(formData);
	}

	isUpdatingBanner = false;

	private updateBanner(payload: FormData) {
		this.isUpdatingBanner = true;

		this.bannerService.updateBanners(payload).pipe(takeUntil(this.destroy$), finalize(() => this.isUpdatingBanner = false)).subscribe({
			next: (resp) => {
				this.closeBannerImagesSection();
				this.getBanners();
				this.responseHandler.success(resp, "updateBanner()");
			},
			error: (err) => this.responseHandler.error(err, "updateBanner()"),
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.complete();
	}

}
