import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { InternalViewsUser } from "src/app/@core/models/litemore/users/internal-views-user";
import { RetrieveRegionsFilters, UpdateRegionPayload } from "src/app/@core/models/region/payload";
import { Region } from "src/app/@core/models/region/region";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CountryProfilesState from "src/app/@core/services/litemore/states/country-profiles.state";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-region-update-modal",
	templateUrl: "./region-update-modal.component.html",
	styleUrls: ["./region-update-modal.component.scss"]
})
export class RegionUpdateModalComponent implements OnInit, OnDestroy {
	@Input() region?: Region;

	destroy$: Subject<boolean> = new Subject<boolean>();

	regionalManagers: InternalViewsUser[] = [];
	countries: CountryProfile[] = [];

	isUpdatingRegion = false;

	updateForm = this.fb.group({
		name: ["", Validators.required],
		customerCareNumber: ["", Validators.required],
		countryId: [null, Validators.required],
		regionalManagerId: [null, Validators.required],
	});
	get name(): AbstractControl | null {
		return this.updateForm.get("name");
	}
	get customerCareNumber(): AbstractControl | null {
		return this.updateForm.get("customerCareNumber");
	}
	get countryId(): AbstractControl | null {
		return this.updateForm.get("countryId");
	}
	get regionalManagerId(): AbstractControl | null {
		return this.updateForm.get("regionalManagerId");
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
		private usersListState: UsersListState,
		private countryProfilesState: CountryProfilesState,
	) { }

	ngOnInit(): void {
		this.disableCountryField();
		this.subscribeToCountryProfiles();
		this.subscribeToRegionalManagers();
	}

	private disableCountryField() {
		this.countryId?.disable();
	}

	private subscribeToCountryProfiles() {
		this.countryProfilesState.countryProfiles$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (countries) => {
				if (countries) this.countries = countries;
			},
			error: () => {
				this.toastService.error("Failed to load countries");
			},
		});
	}

	private subscribeToRegionalManagers() {
		this.usersListState.usersList$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionalManagersData) => {
				if (regionalManagersData) this.regionalManagers = regionalManagersData.profiles;
			}
		});
	}

	onUpdateRegionSubmit() {
		this.updateForm.markAllAsTouched();
		if (this.updateForm.invalid) return;

		const payload: UpdateRegionPayload = {
			regionId: <number>this.region?.regionId,
			name: this.name?.value,
			customerCareNumber: this.customerCareNumber?.value,
			// countryId: this.countryId?.value,
			countryId: <number>this.currentCountryId,
			regionalManagerId: this.regionalManagerId?.value,
		};

		this.isUpdatingRegion = true;

		this.litemoreService.updateRegion(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.isUpdatingRegion = false;
				this.closeUpdateModal(this.region?.regionId);

				this.fetchRegions(this.currentCountryId);
				this.responseHandler.success(res);
			},
			error: (err: any) => {
				this.isUpdatingRegion = false;
				this.responseHandler.error(err, "onUpdateRegionSubmit()");
			},
		});
	}

	closeUpdateModal(id?: number) {
		const modalCloseBtn = document.getElementById(`btn-region-update-modal-${id}`);
		modalCloseBtn?.click();
	}

	private fetchRegions(countryId?: number) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: 1,
			download: true, // to retrieve all regions without pagination restrictions
		};

		this.regionsState.retrieveRegions(filters);
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	prefillUpdateForm() {
		this.updateForm.patchValue({
			name: this.region?.name,
			customerCareNumber: this.region?.customerCareNumber,
			countryId: this.region?.countryId,
			regionalManagerId: this.region?.regionalManagerId,
		});
	}

	resetUpdateForm() {
		this.updateForm.reset();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeUpdateModal(this.region?.regionId);
	}

}
