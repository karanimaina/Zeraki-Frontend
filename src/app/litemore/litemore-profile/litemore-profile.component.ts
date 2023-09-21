import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import CountryProfilesState from "src/app/@core/services/litemore/states/country-profiles.state";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
	selector: "app-litemore-profile",
	templateUrl: "./litemore-profile.component.html",
	styleUrls: ["./litemore-profile.component.scss"]
})
export class LitemoreProfileComponent implements OnInit {
	destroy$: Subject<boolean> = new Subject();
	userInfo$ = this.litemoreUserService.litemoreUser$;
	litemoreUser?: LitemoreUser1;
	userProfileForm!: SubmitFormGroup;
	saving = false;
	countries: Array<CountryProfile> | null = [];

	constructor(
    private litemoreUserService: LitemoreUserService,
	private _responseHandler: ResponseHandlerService,
	private countryProfilesState: CountryProfilesState,
	private toastService: HotToastService,
	private translate:TranslateService
	) { }

	ngOnInit(): void {
		this.bindForm();
		this.getUserInfo();
		this.subscribeToCountryProfiles();
	}

	bindForm() {
		this.userProfileForm = new SubmitFormGroup({
			name: new FormControl("", [Validators.required]),
			email: new FormControl({value: "", disabled: true}, [Validators.required]),
			phoneNumber: new FormControl("", [Validators.required]),
			role: new FormControl({value: "", disabled: true}, [Validators.required]),
			region: new FormControl({value: "", disabled: true}, [Validators.required]),
			country: new FormControl({value: "", disabled: true}, [Validators.required]),
		});
	}

	get name() {
		return this.userProfileForm.get("name");
	}
	get email() {
		return this.userProfileForm.get("email");
	}
	get phoneNumber() {
		return this.userProfileForm.get("phoneNumber");
	}
	get country() {
		return this.userProfileForm.get("country");
	}
	get region() {
		return this.userProfileForm.get("region");
	}
	get role() {
		return this.userProfileForm.get("role");
	}

	getUserInfo() {
		this.userInfo$.pipe(takeUntil(this.destroy$)).subscribe(val => {
			console.warn("userInfo api >> ", val);
			this.litemoreUser = val;
			this.userProfileForm.patchValue({
				name: this.litemoreUser?.name,
				email: this.litemoreUser?.email,
				phoneNumber: this.litemoreUser?.phoneNumber,
				role: this.litemoreUser?.litemoreRoles,
				region: this.litemoreUser?.regionName,
				country: this.litemoreUser?.countryName
			});
		});
	}

	updateUserProfile() {
		const payload = {
			userId: this.litemoreUser?.userId,
			name: this.name?.value,
			phoneNumber: this.phoneNumber?.value,
			email: this.litemoreUser?.email,
			countyId: this.litemoreUser?.countyId
		};
		this.litemoreUserService.updateUser(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				console.warn("Type >> ", typeof resp);
				this._responseHandler.success(resp, "updateUserProfile()");
			},
			error: (error: HttpErrorResponse) => {
				console.error("Type >> ", typeof error);
				this._responseHandler.error(error, "updateUserProfile()");
			},
		});
	}

	private subscribeToCountryProfiles() {
		this.countryProfilesState.countryProfiles$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (countries) => {
				this.countries = countries;
			},
			error: () => {
				this.toastService.error(this.translate.instant('litemore.litemoreProfile.failedToLoadCountries'));
			},
		});
	}

}
