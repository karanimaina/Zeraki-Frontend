import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
	RetrieveRegionCountyFilters,
	UpdateRegionCountyPayload
} from "src/app/@core/models/country/county/payload";
import { Region } from "src/app/@core/models/region/region";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { TranslateService } from "@ngx-translate/core";
import { County } from "src/app/@core/models/country/county/county";

@Component({
	selector: "app-county-update-modal",
	templateUrl: "./county-update-modal.component.html",
	styleUrls: ["./county-update-modal.component.scss"]
})
export class CountyUpdateModalComponent implements OnInit, OnDestroy {
	@Input() county?: County;

	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getRegionsStatus$: Observable<APIStatus | null> =
		this.regionsState.getRegionsStatus$;
	regions: Region[] = [];

	isUpdatingCounty = false;

	updateForm = this.fb.group({
		name: ["", Validators.required],
		regionId: [null, Validators.required],
		code: ["", Validators.required]
	});

	get name(): AbstractControl | null {
		return this.updateForm.get("name");
	}
	get regionId(): AbstractControl | null {
		return this.updateForm.get("regionId");
	}
	get code(): AbstractControl | null {
		return this.updateForm.get("code");
	}

	get currentCountryId(): number | undefined {
		return this.currentCountryState.getCurrentCountry()?.countryId;
	}

	constructor(
		private litemoreService: LitemoreService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private fb: FormBuilder,
		private regionsState: RegionsState,
		private currentCountryState: CurrentCountryState,
		private regionCountiesState: RegionCountiesState,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.subscribeToRegions();
	}

	private subscribeToRegions() {
		this.regionsState.regions$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionsData) => {
				if (regionsData) this.regions = regionsData.regions;
			},
			error: () => {
				this.toastService.error(
					this.translate.instant(
						"litemore.managers.countries.components.countyUpdateModal.failed to load regions"
					)
				);
			}
		});
	}

	onUpdateCountySubmit() {
		this.updateForm.markAllAsTouched();
		if (this.updateForm.invalid) return;

		const payload: UpdateRegionCountyPayload = {
			countyId: <number>this.county?.countyId,
			name: this.name?.value,
			regionId: this.regionId?.value,
			code: this.code?.value
		};

		this.isUpdatingCounty = true;

		this.litemoreService
			.updateRegionCounty(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.isUpdatingCounty = false;
					this.closeUpdateModal(this.county?.countyId);

					this.fetchCounties(
						1,
						<number>this.currentCountryId,
						payload.regionId
					);
					this.responseHandler.success(res);
				},
				error: (err: any) => {
					this.isUpdatingCounty = false;
					this.responseHandler.error(err, "onUpdateCountySubmit()");
				}
			});
	}

	closeUpdateModal(id?: number) {
		const modalCloseBtn = document.getElementById(
			`btn-county-update-modal-${id}`
		);
		modalCloseBtn?.click();
	}

	private fetchCounties(page = 1, countryId: number, regionId?: number) {
		const filters: RetrieveRegionCountyFilters = {
			currentPage: page,
			countryId,
			regionId
		};

		this.regionCountiesState.retrieveRegionCounties(filters);
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	prefillUpdateForm() {
		this.updateForm.patchValue({
			name: this.county?.name,
			regionId: this.county?.regionId,
			code: this.county?.code
		});
	}

	resetUpdateForm() {
		this.updateForm.reset();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeUpdateModal(this.county?.countyId);
	}
}
