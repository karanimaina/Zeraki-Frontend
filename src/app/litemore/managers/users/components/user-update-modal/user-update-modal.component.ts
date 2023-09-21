import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Validators, AbstractControl, FormBuilder } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { InternalViewsUser } from "src/app/@core/models/litemore/users/internal-views-user";
import {
	RetrieveInternalViewsUsersFilters,
	UpdateInternalViewsUserPayload
} from "src/app/@core/models/litemore/users/payloads";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RolesState from "src/app/@core/services/litemore/states/roles.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { County } from "src/app/@core/models/country/county/county";

@Component({
	selector: "app-user-update-modal",
	templateUrl: "./user-update-modal.component.html",
	styleUrls: ["./user-update-modal.component.scss"]
})
export class UserUpdateModalComponent implements OnInit, OnDestroy {
	@Input() user?: InternalViewsUser;

	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	roles$ = this.rolesState.roles$;
	getRolesStatus$ = this.rolesState.getRolesStatus$;

	counties: County[] | null = [];

	isUpdatingUser = false;

	updateForm = this.fb.group({
		name: ["", Validators.required],
		email: ["", Validators.required],
		phoneNumber: ["", Validators.required],
		countyId: [null, Validators.required],
		roles: [null, Validators.required]
	});
	get name(): AbstractControl | null {
		return this.updateForm.get("name");
	}
	get email(): AbstractControl | null {
		return this.updateForm.get("email");
	}
	get phoneNumber(): AbstractControl | null {
		return this.updateForm.get("phoneNumber");
	}
	get countyId(): AbstractControl | null {
		return this.updateForm.get("countyId");
	}
	get roles(): AbstractControl | null {
		return this.updateForm.get("roles");
	}

	constructor(
		private litemoreService: LitemoreService,
		private fb: FormBuilder,
		private regionCountiesState: RegionCountiesState,
		private currentCountryState: CurrentCountryState,
		private rolesState: RolesState,
		private usersListState: UsersListState,
		private responseHandler: ResponseHandlerService
	) {}

	ngOnInit(): void {
		this.subscribeToCounties();
	}

	private subscribeToCounties() {
		this.regionCountiesState.regionCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (regionCountiesData) => {
					this.counties = regionCountiesData?.counties || null;
				}
			});
	}

	onUpdateFormSubmit() {
		this.updateForm.markAllAsTouched();
		if (this.updateForm.invalid) return;

		const payload: UpdateInternalViewsUserPayload = {
			userId: <number>this.user?.userId,
			name: this.name?.value,
			email: this.email?.value,
			phoneNumber: this.phoneNumber?.value,
			litemoreRoles: this.roles?.value,
			countyId: this.countyId?.value
		};

		this.isUpdatingUser = true;

		this.litemoreService
			.updateUser(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res: any) => {
					this.closeUpdateModal(this.user?.userId);
					this.responseHandler.success(res);
					this.isUpdatingUser = false;

					this.fetchUsers();
				},
				error: (err: any) => {
					this.responseHandler.error(err, "onUpdateFormSubmit()");
					this.isUpdatingUser = false;
				}
			});
	}

	closeUpdateModal(id?: number) {
		const modalCloseBtn = document.getElementById(
			`btn-user-update-modal-${id}`
		);
		modalCloseBtn?.click();
	}

	private fetchUsers() {
		const payload: RetrieveInternalViewsUsersFilters = {
			countryId: this.currentCountryState.getCurrentCountry()?.countryId
		};

		this.usersListState.retrieveUsersList(payload);
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	prefillUpdateForm() {
		this.updateForm.patchValue({
			name: this.user?.name,
			email: this.user?.email,
			phoneNumber: this.user?.phoneNumber,
			roles: this.user?.litemoreRoles,
			countyId: this.user?.countyId
		});
	}

	resetUpdateForm() {
		this.updateForm.reset();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
		this.closeUpdateModal(this.user?.userId);
	}
}
