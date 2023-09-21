import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { BannerService } from "src/app/@core/services/banner/banner.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import * as dayjs from "dayjs";
import { TranslateService } from "@ngx-translate/core";
import { LitemoreBanner } from "src/app/@core/models/banners/litemore-banner";

@Component({
	selector: "app-banner-addition",
	templateUrl: "./banner-addition.component.html",
	styleUrls: ["./banner-addition.component.scss"]
})
export class BannerAdditionComponent implements OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	@Input() isNewRecord = true;
	@Input() bannerItem?: LitemoreBanner;
	@Input() isLoadingCountries = false;
	@Input() allCountries: Array<CountryProfile> = [];

	@Output() onAdditionSuccess = new EventEmitter<any>();
	@Output() onUpdateSuccess = new EventEmitter<any>();

	@ViewChild("desktopFileInput") desktopFileInput?: ElementRef;
	@ViewChild("tabletFileInput") tabletFileInput?: ElementRef;
	@ViewChild("mobileFileInput") mobileFileInput?: ElementRef;

	isAddingBanner = false;
	isUpdatingBanner = false;

	allTargetUsers: Array<string> = ["Teachers", "Students"];
	allBannerStatuses: Array<string> = ["Preview", "Shown", "Hidden"];

	startDateMin = dayjs().format("YYYY-MM-DD");
	endDateMin = this.startDateMin;

	desktopFile?: File;
	desktopFileError = "";

	tabletFile?: File;
	tabletFileError = "";

	mobileFile?: File;
	mobileFileError = "";

	additionForm = this.fb.group({
		title: ["", Validators.required],
		startDate: ["", Validators.required],
		endDate: ["", Validators.required],
		countries: [[], Validators.required],
		targetUsers: [[], Validators.required],
		bannerStatus: ["", Validators.required],
	});
	get title(): AbstractControl | null {
		return this.additionForm.get("title");
	}
	get startDate(): AbstractControl | null {
		return this.additionForm.get("startDate");
	}
	get endDate(): AbstractControl | null {
		return this.additionForm.get("endDate");
	}
	get countries(): AbstractControl | null {
		return this.additionForm.get("countries");
	}
	get targetUsers(): AbstractControl | null {
		return this.additionForm.get("targetUsers");
	}
	get bannerStatus(): AbstractControl | null {
		return this.additionForm.get("bannerStatus");
	}

	constructor(
		private bannerService: BannerService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private fb: FormBuilder,
	) { }

	onStartDateChange() {
		this.startDate?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
			next: (value) => {
				const startDate = dayjs(this.startDate?.value);
				const endDate = dayjs(this.endDate?.value);

				const dateDiff = startDate.diff(endDate, "millisecond", true);
				if (dateDiff > 0) this.endDate?.reset();

				this.endDateMin = value;
			},
		});
	}

	onDesktopFileChange(event: any) {
		this.desktopFile = event.target.files[0];
		this.desktopFileError = "";
	}
	onTabletFileChange(event: any) {
		this.tabletFile = event.target.files[0];
		this.tabletFileError = "";
	}
	onMobileFileChange(event: any) {
		this.mobileFile = event.target.files[0];
		this.mobileFileError = "";
	}

	onAdditionFormSubmision() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		if (this.isNewRecord && !this.desktopFile) {
			this.desktopFileError = this.translate.instant("litemore.banners.desktopFileRequiredError");
			return;
		}
		if (this.isNewRecord && !this.tabletFile) {
			this.tabletFileError = this.translate.instant("litemore.banners.tabletFileRequiredError");
			return;
		}
		if (this.isNewRecord && !this.mobileFile) {
			this.mobileFileError = this.translate.instant("litemore.banners.mobileFileRequiredError");
			return;
		}

		const formData = new FormData();

		const bannerDetails = {
			title: this.title?.value,
			startDate: Date.parse(this.startDate?.value),
			endDate: Date.parse(this.endDate?.value),
			countries: this.countries?.value.map(item => item.countryId),
			targetUsers: this.targetUsers?.value,
			bannerStatus: this.bannerStatus?.value,
		};

		if (!this.isNewRecord) bannerDetails["bannerId"] = this.bannerItem?.bannerId;

		formData.append("bannerDetails", JSON.stringify(bannerDetails));

		if (this.isNewRecord) {
			formData.append("desktopFile", this.desktopFile!);
			formData.append("tabletFile", this.tabletFile!);
			formData.append("mobileFile", this.mobileFile!);
		}

		this.isNewRecord ? this.addBanners(formData) : this.updateBanner(formData);
	}

	private addBanners(payload: FormData) {
		this.isAddingBanner = true;

		this.bannerService.addBanners(payload).pipe(takeUntil(this.destroy$), finalize(() => this.isAddingBanner = false)).subscribe({
			next: (resp) => {
				this.closeAdditionFormModal();
				this.responseHandler.success(resp, "addBanners()");
				this.onAdditionSuccess.emit();
			},
			error: (err) => {
				this.responseHandler.error(err, "addBanners()");
			}
		});
	}

	private updateBanner(payload: FormData) {
		this.isUpdatingBanner = true;

		this.bannerService.updateBanners(payload).pipe(takeUntil(this.destroy$), finalize(() => this.isUpdatingBanner = false)).subscribe({
			next: (resp) => {
				this.closeAdditionFormModal();
				this.responseHandler.success(resp, "updateBanner()");
				this.onUpdateSuccess.emit();
			},
			error: (err) => {
				this.responseHandler.error(err, "updateBanner()");
			}
		});
	}

	resetAdditionForm() {
		this.additionForm.reset();

		this.desktopFileInput!.nativeElement.value = null;
		this.tabletFileInput!.nativeElement.value = null;
		this.mobileFileInput!.nativeElement.value = null;
	}

	closeAdditionFormModal() {
		const modalCloseBtn = document.getElementById(`btn-banner-add-modal-${this.modalUpdateId}`);
		modalCloseBtn?.click();
	}

	get modalUpdateId(): number | undefined {
		return (this.isNewRecord ? 0 : this.bannerItem?.bannerId);
	}

	compareCountries(item: CountryProfile, selected: { countryId: number; name: string }) {
		return item.countryId === selected.countryId;
	}

	prefillUpdateForm() {
		this.additionForm.patchValue({
			title: this.bannerItem?.title,
			startDate: dayjs(this.bannerItem?.startDate).format("YYYY-MM-DD"),
			endDate: dayjs(this.bannerItem?.endDate).format("YYYY-MM-DD"),
			countries: this.bannerItem?.showInCountries,
			targetUsers: this.bannerItem?.targetUsers,
			bannerStatus: this.bannerItem?.bannerStatus,
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeAdditionFormModal();
	}

}
