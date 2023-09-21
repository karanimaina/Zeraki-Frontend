import { Component, OnDestroy, OnInit } from "@angular/core";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { SubCounty } from "src/app/@core/models/country/county/subcounty";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import SubCountiesState from "src/app/@core/services/litemore/states/sub-county.state";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { phoneNumberValidator } from "src/app/@core/shared/directives/phone-validator.directive";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-create-school",
	templateUrl: "./create-school.component.html",
	styleUrls: ["./create-school.component.scss"]
})
export class CreateSchoolComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject();
	loggedInUser$?: Observable<LitemoreUser1> =
		this.litemoreUserService.litemoreUser$;
	counties?: Array<any>;
	countries?: Array<CountryProfile>;
	subCounties$?: Observable<Array<SubCounty>> =
		this.subCountiesState.subCounties$;
	subCounties: Array<SubCounty> = [];
	schoolTypes: any = [];
	genderTypes: Array<{ name: string; code: number; value: string }> = [];
	boardingTypes: Array<{ name: string; value: string }> = [];
	ownershipTypes: Array<{ name: string; value: string }> = [];
	regionalLevel: Array<{ name: string; value: string }> = [];
	getSubCountiesStatus$ = this.subCountiesState.getSubCountiesStatus$;

	isLoadingSubcounties = false;

	schoolPopulationCategories: Array<{ value: number; name: string }> = [
		{ value: 1, name: "1-150" },
		{ value: 2, name: "151-300" },
		{ value: 3, name: "301-500" },
		{ value: 4, name: "501-800" },
		{ value: 5, name: "801-1200" },
		{ value: 6, name: "1201-1500" },
		{ value: 7, name: "1501-2000" },
		{ value: 8, name: "2001+" }
	];

	newSchoolForm!: FormGroup;
	defaultCountyLabel = "County";

	constructor(
		private router: Router,
		private schoolService: SchoolService,
		private litemoreUserService: LitemoreUserService,
		private countryService: CountryService,
		private subCountiesState: SubCountiesState,
		private toastService: HotToastService,
		private translate: TranslateService,
		private fb: FormBuilder,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.bindForm();
		this.loadCountries();
		this.setBoardingStatus();
		this.setGenderTypes();
		this.setOwnershipTypes();
		this.setRegionalLevels();
		this.subscribeToSubCounties();
	}

	private bindForm(): void {
		this.newSchoolForm = this.fb.group({
			name: new FormControl("", [Validators.required]),
			genderType: new FormControl("", [Validators.required]),
			educationSystemId: new FormControl("", [Validators.required]),
			schoolOwnershipType: new FormControl("", Validators.required),
			registrationCode: new FormControl("", [Validators.required]),
			email: new FormControl("", [Validators.required, Validators.email]),
			phone: new FormControl("", [Validators.required, phoneNumberValidator]),
			country: new FormControl("", [Validators.required]),
			countyId: new FormControl("", Validators.required),
			subCountyId: new FormControl(""),
			schoolRegionalLevel: new FormControl(""),
			boardingStatus: new FormControl("", [Validators.required]),
			contactPersonName: new FormControl("", Validators.required),
			contactPersonPhone: new FormControl("", [
				Validators.required,
				phoneNumberValidator
			]),
			partner: new FormControl(""),
			population: new FormControl("", [Validators.required])
		});
		this.watchCountry();
		this.watchCounty();
	}

	get educationSystemId() {
		return this.newSchoolForm.get("educationSystemId");
	}
	get country() {
		return this.newSchoolForm.get("country");
	}
	get countyId() {
		return this.newSchoolForm.get("countyId");
	}
	get subCountyId() {
		return this.newSchoolForm.get("subCountyId");
	}
	get schoolRegionalLevel() {
		return this.newSchoolForm.get("schoolRegionalLevel");
	}
	get schoolOwnershipType() {
		return this.newSchoolForm.get("schoolOwnershipType");
	}

	setBoardingStatus() {
		this.translate
			.get([
				"settings.schoolInfoProfile.boardingStatus.mixed",
				"settings.schoolInfoProfile.boardingStatus.day",
				"settings.schoolInfoProfile.boardingStatus.boarding"
			])
			.subscribe((translations) => {
				this.boardingTypes = [
					{
						name: translations[
							"settings.schoolInfoProfile.boardingStatus.mixed"
						],
						value: "Mixed"
					},
					{
						name: translations["settings.schoolInfoProfile.boardingStatus.day"],
						value: "Day"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.boardingStatus.boarding"
						],
						value: "Boarding"
					}
				];
			});
	}

	setGenderTypes() {
		this.translate
			.get([
				"settings.schoolInfoProfile.genderType.boys",
				"settings.schoolInfoProfile.genderType.girls",
				"settings.schoolInfoProfile.genderType.mixed"
			])
			.subscribe((translations) => {
				this.genderTypes = [
					{
						name: translations["settings.schoolInfoProfile.genderType.boys"],
						code: 1,
						value: "Boys School"
					},
					{
						name: translations["settings.schoolInfoProfile.genderType.girls"],
						code: 2,
						value: "Girls School"
					},
					{
						name: translations["settings.schoolInfoProfile.genderType.mixed"],
						code: 3,
						value: "Mixed School"
					}
				];
			});
	}

	setOwnershipTypes() {
		this.translate
			.get([
				"settings.schoolInfoProfile.ownershipType.public",
				"settings.schoolInfoProfile.ownershipType.private"
			])
			.subscribe((translations) => {
				this.ownershipTypes = [
					{
						name: translations[
							"settings.schoolInfoProfile.ownershipType.public"
						],
						value: "Public"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.ownershipType.private"
						],
						value: "Private"
					}
				];
			});
	}

	setRegionalLevels() {
		this.translate
			.get([
				"settings.schoolInfoProfile.regionalLevel.national",
				"settings.schoolInfoProfile.regionalLevel.extraCounty",
				"settings.schoolInfoProfile.regionalLevel.county",
				"settings.schoolInfoProfile.regionalLevel.subCounty"
			])
			.subscribe((translations) => {
				this.regionalLevel = [
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.national"
						],
						value: "national"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.extraCounty"
						],
						value: "extra-county"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.county"
						],
						value: "county"
					},
					{
						name: translations[
							"settings.schoolInfoProfile.regionalLevel.subCounty"
						],
						value: "sub-county"
					}
				];
			});
	}

	loadCountries() {
		this.countryService.getCountry().subscribe((r) => {
			this.countries = r;
		});
	}

	watchCountry() {
		this.country?.valueChanges.subscribe((selectedCountry) => {
			if (selectedCountry) {

				this.countyId?.reset();
				this.subCountyId?.reset();
				this.educationSystemId?.reset();
				this.schoolRegionalLevel?.reset();

				this.setCountrySpecificValidators();
				this.getCounties(selectedCountry.countryId);
			}
		});
	}

	setCountrySpecificValidators() {
		this.schoolRegionalLevel?.removeValidators(Validators.required);
		this.subCountyId?.removeValidators(Validators.required);
		this.schoolOwnershipType?.removeValidators(Validators.required);

		if (this.country?.value?.countryId == 1) {
			this.schoolRegionalLevel?.addValidators(Validators.required);
			this.subCountyId?.addValidators(Validators.required);
			this.schoolOwnershipType?.addValidators(Validators.required);
		}

		this.schoolRegionalLevel?.updateValueAndValidity();
		this.subCountyId?.updateValueAndValidity();
		this.schoolOwnershipType?.updateValueAndValidity();
	}

	getCounties(countryId: number) {
		this.countryService
			.getCounties(countryId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => {
					this.counties = resp.countryCounties.counties;
					this.schoolTypes = resp.countryEducationSystems.educationSystems;
				}
			});
	}

	watchCounty() {
		this.countyId?.valueChanges.subscribe((selectedCounty) => {
			if (selectedCounty) {
				this.isLoadingSubcounties = true;
				this.subCountyId?.reset();
				this.getSubCounties(selectedCounty);
			}
		});
	}

	getSubCounties(countyId: number) {
		const params: any = {
			countyId: countyId
		};
		this.subCountiesState.retrieveSubCounties(params);
	}

	subscribeToSubCounties() {
		this.subCountiesState.subCounties$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (subCounties) => {
					this.subCounties = subCounties || [];
				}
			});
	}

	isRegistering = false;
	createSchool() {
		// console.log("form submitted", this.newSchoolForm);
		this.isRegistering = true;
		if (this.newSchoolForm.invalid) {
			this.toastService.info("Invalid form submitted");
			this.isRegistering = false;
			return;
		}

		const {
			name,
			genderType,
			educationSystemId,
			registrationCode,
			email,
			phone,
			countyId,
			subCountyId,
			partner,
			contactPersonName,
			contactPersonPhone,
			boardingStatus,
			schoolOwnershipType,
			schoolRegionalLevel,
			population
		} = this.newSchoolForm.value;

		const post = {
			name: name,
			genderType: genderType,
			educationSystemId: educationSystemId,
			registrationCode: registrationCode,
			email: email,
			phone: phone,
			countyId: countyId,
			subCountyId: subCountyId,
			partner: partner || "",
			contactPersonName: contactPersonName,
			contactPersonPhone: contactPersonPhone,
			boardingStatus: boardingStatus,
			schoolOwnershipType: schoolOwnershipType,
			schoolRegionalLevel: schoolRegionalLevel
		};

		let params = "?";

		if (population) {
			params += "sms_no_determinant=" + population;
		}

		this.schoolService
			.createSchool(post, params)
			.pipe(
				finalize(() => (this.isRegistering = false)),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp);
					this.router.navigate(["/litemore/am"]);
				},
				error: (error: any) => {
					this.responseHandler.error(error, "createSchool()");
				}
			});
	}

	toggleAddSchool(status: boolean) {
		if (status == false) {
			this.newSchoolForm.reset();
		}
	}
}
