import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { InternalViewsUser } from "src/app/@core/models/litemore/users/internal-views-user";
import { RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { AddRegionPayload, RetrieveRegionsFilters } from "src/app/@core/models/region/payload";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionsState from "src/app/@core/services/litemore/states/regions.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { APIStatus } from "src/app/@core/enums/api-status";
import CountryProfilesState from "src/app/@core/services/litemore/states/country-profiles.state";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-region-addition-modal",
	templateUrl: "./region-addition-modal.component.html",
	styleUrls: ["./region-addition-modal.component.scss"]
})
export class RegionAdditionModalComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	regionalManagers: InternalViewsUser[] = [];
	countries$ = this.countryProfilesState.countryProfiles$;

	isAddingRegion = false;

	additionForm = this.fb.group({
		name: ["", Validators.required],
		customerCareNumber: ["", Validators.required],
		countryId: [null, Validators.required],
		regionalManagerId: [null],
	});
	get name(): AbstractControl | null {
		return this.additionForm.get("name");
	}
	get customerCareNumber(): AbstractControl | null {
		return this.additionForm.get("customerCareNumber");
	}
	get countryId(): AbstractControl | null {
		return this.additionForm.get("countryId");
	}
	get regionalManagerId(): AbstractControl | null {
		return this.additionForm.get("regionalManagerId");
	}

	get currentCountryId(): number | undefined {
		return this.currentCountryState.currentCountryId;
	}

	constructor(
		private litemoreService: LitemoreService,
		private fb: FormBuilder,
		private regionsState: RegionsState,
		private countryProfilesState: CountryProfilesState,
		private currentCountryState: CurrentCountryState,
		private usersListState: UsersListState,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.disableCountryField();
		this.fetchBDevManagers();
		this.subscribeToBdevManagers();
	}

	private disableCountryField() {
		this.countryId?.disable();
	}

	private prefillRegionAdditionForm() {
		this.additionForm.patchValue({
			// countryId: {value: this.currentCountryState.currentCountryId, disabled: true},
			countryId: this.currentCountryState.currentCountryId,
		});
	}

	private subscribeToBdevManagers() {
		this.usersListState.usersList$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionalManagersData) => {
				if (regionalManagersData) this.regionalManagers = regionalManagersData.profiles;
			}
		});
	}

	private fetchBDevManagers() {
		const filters: RetrieveInternalViewsUsersFilters = {
			countryId: this.currentCountryId,
			role: LitemoreUserRole.BDEV_MANAGER,
			download: true,
		};

		this.usersListState.retrieveUsersList(filters);
	}

	onAdditionFormSubmit() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		const payload: AddRegionPayload = {
			name: this.name?.value,
			customerCareNumber: this.customerCareNumber?.value,
			// countryId: this.countryId?.value,
			countryId: <number>this.currentCountryId,
		};

		this.regionalManagerId?.value? payload.regionalManagerId = this.regionalManagerId?.value: "";

		this.isAddingRegion = true;

		this.litemoreService.addRegion(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.closeAdditionFormModal();
				this.isAddingRegion = false;

				this.fetchRegions(<number>this.currentCountryId);
				this.responseHandler.success(res);
			},
			error: (err: any) => {
				this.isAddingRegion = false;
				this.responseHandler.error(err, "onAdditionFormSubmit()");
			},
		});
	}

	closeAdditionFormModal() {
		const modalCloseBtn = document.getElementById("btn-region-add-modal");
		modalCloseBtn?.click();
	}

	private fetchRegions(countryId?: number) {
		const filters: RetrieveRegionsFilters = {
			countryId,
			currentPage: 1,
		};

		this.regionsState.retrieveRegions(filters);
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	resetAdditionForm() {
		this.additionForm.reset();
		this.prefillRegionAdditionForm();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeAdditionFormModal();
	}

}
