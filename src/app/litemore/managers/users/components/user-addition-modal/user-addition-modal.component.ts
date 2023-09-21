import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AddInternalViewsUserPayload, RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RolesState from "src/app/@core/services/litemore/states/roles.state";
import UsersListState from "src/app/@core/services/litemore/states/users-list-state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";
import { County } from "src/app/@core/models/country/county/county";

@Component({
	selector: "app-user-addition-modal",
	templateUrl: "./user-addition-modal.component.html",
	styleUrls: ["./user-addition-modal.component.scss"]
})
export class UserAdditionModalComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	roles$ = this.rolesState.roles$;
	getRolesStatus$ = this.rolesState.getRolesStatus$;

	counties: County[] | null = [];

	isAddingUser = false;

	additionForm = this.fb.group({
		name: ["", [Validators.required, emptyStringValidator]],
		email: ["", Validators.required, emptyStringValidator],
		phoneNumber: ["", [Validators.required, emptyStringValidator]],
		countyId: [null, [Validators.required]],
		roles: [[], Validators.required],
	});
	get name(): AbstractControl | null {
		return this.additionForm.get("name");
	}
	get email(): AbstractControl | null {
		return this.additionForm.get("email");
	}
	get phoneNumber(): AbstractControl | null {
		return this.additionForm.get("phoneNumber");
	}
	get countyId(): AbstractControl | null {
		return this.additionForm.get("countyId");
	}
	get roles(): AbstractControl | null {
		return this.additionForm.get("roles");
	}

	constructor(
    private litemoreService: LitemoreService,
    private fb: FormBuilder,
	private regionCountiesState: RegionCountiesState,
    private currentCountryState: CurrentCountryState,
    private usersListState: UsersListState,
    private rolesState: RolesState,
    private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.subscribeToCounties();
		this.disableEmailField();
		this.subscribeToNameField();
	}

	private disableEmailField() {
		this.email?.disable();
	}

	private subscribeToNameField() {
		this.name?.valueChanges.subscribe({
			next: (value) => {
				let emailSuffix = "";

				if (this.currentCountryState.currentCountryId === 1) { // Kenyan User
					emailSuffix = ".ke";
				}

				let generatedEmail = "";
				generatedEmail = `${value?.trim()}@zeraki.co${emailSuffix}`.replace(/\s+/g, ".").toLowerCase();
				this.email?.setValue(generatedEmail);
			},
		});
	}

	private subscribeToCounties() {
		this.regionCountiesState.regionCounties$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (regionCountiesData) => {
				this.counties = regionCountiesData?.counties || null;
			},
		});
	}

	onAdditionFormSubmit() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		const payload: AddInternalViewsUserPayload = {
			name: this.name?.value,
			email: this.email?.value,
			phoneNumber: this.phoneNumber?.value,
			litemoreRoles: this.roles?.value,
		};

		this.countyId?.value? payload.countyId = this.countyId?.value: "";

		this.isAddingUser = true;

		this.litemoreService.addUser(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.closeAdditionFormModal();
				this.isAddingUser = false;
				this.responseHandler.success(res, "onAdditionFormSubmit()");
				this.fetchUsers();
			},
			error: (err: any) => {
				this.isAddingUser = false;
				this.responseHandler.error(err, "onAdditionFormSubmit()");
			},
		});
	}

	closeAdditionFormModal() {
		const modalCloseBtn = document.getElementById("btn-user-add-modal");
		modalCloseBtn?.click();
	}

	private fetchUsers() {
		const payload: RetrieveInternalViewsUsersFilters = {
			countryId: this.currentCountryState.getCurrentCountry()?.countryId,
		};

		this.usersListState.retrieveUsersList(payload);
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
