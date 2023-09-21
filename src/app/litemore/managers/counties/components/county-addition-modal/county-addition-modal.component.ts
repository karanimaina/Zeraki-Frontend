import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
	AddRegionCountyPayload,
	RetrieveRegionCountyFilters
} from "src/app/@core/models/country/county/payload";
import { Region } from "src/app/@core/models/region/region";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-county-addition-modal",
	templateUrl: "./county-addition-modal.component.html",
	styleUrls: ["./county-addition-modal.component.scss"]
})
export class CountyAdditionModalComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getRegionsStatus$: Observable<APIStatus | null> =
		this.regionsState.getRegionsStatus$;
	regions: Region[] = [];

	isAddingCounty = false;

	additionForm = this.fb.group({
		name: ["", Validators.required],
		regionId: [null, Validators.required],
		code: ["", Validators.required]
	});

	get name(): AbstractControl | null {
		return this.additionForm.get("name");
	}
	get regionId(): AbstractControl | null {
		return this.additionForm.get("regionId");
	}
	get code(): AbstractControl | null {
		return this.additionForm.get("code");
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
		private regionCountiesState: RegionCountiesState
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
				this.toastService.error("Failed to load regions");
			}
		});
	}

	onAddCountySubmit() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		const payload: AddRegionCountyPayload = {
			name: this.name?.value,
			code: this.code?.value,
			regionId: this.regionId?.value
		};

		this.isAddingCounty = true;

		this.litemoreService
			.addCounty(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.closeAdditionFormModal();
					this.isAddingCounty = false;

					this.fetchCounties(1, <number>this.currentCountryId);
					this.responseHandler.success(res);
				},
				error: (err: any) => {
					this.isAddingCounty = false;
					this.responseHandler.error(err, "onAddCountySubmit()");
				}
			});
	}

	closeAdditionFormModal() {
		const modalCloseBtn = document.getElementById("btn-county-add-modal");
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

	resetAdditionForm() {
		this.additionForm.reset();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeAdditionFormModal();
	}
}
