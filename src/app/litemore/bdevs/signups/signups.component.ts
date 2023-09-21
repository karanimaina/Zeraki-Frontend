import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-signups",
	templateUrl: "./signups.component.html",
	styleUrls: ["./signups.component.scss"]
})
export class SignUpsComponent implements OnInit, OnDestroy {

	error_add_invoice = false;
	error_registration = false;
	error_email = false;
	error_partner = false;
	error_msg = "";
	roleSubject:any;

	disabled = false;

	dataoptions: any = {};
	school_details: any = {};
	ss_school: any = {}; // form

	ss_school_population_categories: any[] = [
		{ value: 1, name: "1-150" }, { value: 2, name: "151-300" },
		{ value: 3, name: "301-500" }, { value: 4, name: "501-800" },
		{ value: 5, name: "801-1200" }, { value: 6, name: "1201-1500" },
		{ value: 7, name: "1501-2000" }, { value: 8, name: "2001+" },
	];

	verified_firstShown = true;
	unverified_firstShown = false;

	registerSchoolForm = this.fb.group({
		schoolName: ["", Validators.required],
		genderType: [null, Validators.required],
		schoolType: [null, Validators.required],
		schoolCode: ["", Validators.required], // aka 'ss_school.registration'
		schoolPopulationCategory: [null, Validators.required],
		email: ["", [Validators.required, Validators.email]],
		phoneNumber: ["", Validators.required],
		county: [null, Validators.required],
		accountManager: [null, Validators.required],
		contactPersonName: ["", Validators.required],
		contactPersonPhone: ["", Validators.required],
	});

	get schoolName(): AbstractControl | null {
		return this.registerSchoolForm.get("schoolName");
	}
	get genderType(): AbstractControl | null {
		return this.registerSchoolForm.get("genderType");
	}
	get schoolType(): AbstractControl | null {
		return this.registerSchoolForm.get("schoolType");
	}
	get schoolCode(): AbstractControl | null {
		return this.registerSchoolForm.get("schoolCode");
	}
	get schoolPopulationCategory(): AbstractControl | null {
		return this.registerSchoolForm.get("schoolPopulationCategory");
	}
	get email(): AbstractControl | null {
		return this.registerSchoolForm.get("email");
	}
	get phoneNumber(): AbstractControl | null {
		return this.registerSchoolForm.get("phoneNumber");
	}
	get county(): AbstractControl | null {
		return this.registerSchoolForm.get("county");
	}
	get accountManager(): AbstractControl | null {
		return this.registerSchoolForm.get("accountManager");
	}
	get contactPersonName(): AbstractControl | null {
		return this.registerSchoolForm.get("contactPersonName");
	}
	get contactPersonPhone(): AbstractControl | null {
		return this.registerSchoolForm.get("contactPersonPhone");
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	constructor(
    private litemoreService: LitemoreService,
    private dataService: DataService,
    private toast: HotToastService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
	) { }

	ngOnInit(): void {
		this.getGenderTypes();
		this.getSchoolTypes();
		this.getAccountManagers();
		this.getCounties();
		this.getUserInit();

		this.dataoptions.verified_isCurrent = true;
		this.dataoptions.unverified_isCurrent = false;
		this.dataoptions.verified_sortType = "schoolid";
		this.dataoptions.verified_sortReverse = true;
		this.dataoptions.unverified_sortType = "schoolid";
		this.dataoptions.unverified_sortReverse = true;
		this.dataoptions.verified_firstShown = true;
		this.dataoptions.unverified_firstShown = false;
		this.school_details.complete = false;
	}

	ngOnDestroy(): void {
		this.userInitSub?.unsubscribe();
		this.verifiedSchoolsSub?.unsubscribe();
		this.unverifiedSchoolsSub?.unsubscribe();
		this.accountManagersSub?.unsubscribe();
		this.countiesSub?.unsubscribe();
		this.schoolTypesSub?.unsubscribe();
		this.genderTypesSub?.unsubscribe();
		this.updateSchoolCountySub?.unsubscribe();
		this.updateSchoolAccountManagerSub?.unsubscribe();
		this.updateSchoolAccountOwnerSub?.unsubscribe();
		this.rejectSchoolSub?.unsubscribe();
		this.verifySelfSignUpSchoolSub?.unsubscribe();
		this.invalidateSchoolSub?.unsubscribe();
		this.register_ss_School_sub?.unsubscribe();
	}

	initBooleans() {
		this.error_add_invoice = false;
		this.error_registration = false;
		this.error_email = false;
		this.error_partner = false;
		this.error_msg = "";
	}

	userInitSub?: Subscription;
	user_init: any = null;

	getUserInit() {
		this.userInitSub = this.dataService.getUserInit().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.user_init = resp;
				this.getVerifiedSchools(this.user_init);
				this.getUnverifiedSchools(this.user_init);
			},
			error: err => {
				// console.error(err);

			}
		});
	}

	verifiedSchoolsSub?: Subscription;
	verified_ss_schools: any = null;
	can_edit = false;

	getVerifiedSchools(user_init: any) {
		if (user_init.role >= 100 && user_init.role < 200) {
			this.verifiedSchoolsSub = this.litemoreService.getVerifiedSelfSignUpSchools().subscribe({
				next: (resp: any) => {
					// console.log(resp);

					this.verified_ss_schools = resp.verified_ss_schools;
					this.can_edit = resp.can_edit;
				},
				error: err => {
					console.error(err);

				}
			});
		}
		// else {

		// }
	}

	unverifiedSchoolsSub?: Subscription;
	unverified_ss_schools: any = null;

	getUnverifiedSchools(user_init: any) {
		if (user_init.role >= 100 && user_init.role < 200) {
			this.verifiedSchoolsSub = this.litemoreService.getUnverifiedSelfSignUpSchools().subscribe({
				next: (resp: any) => {
					// console.log(resp);

					this.unverified_ss_schools = resp.unverified_ss_schools;
				},
				error: err => {
					console.error(err);

				}
			});
		}
		// else {

		// }
	}

	accountManagersSub?: Subscription;
	account_managers: any[] = [];

	getAccountManagers() {
		this.accountManagersSub = this.litemoreService.getZerakiAccountManagers().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.account_managers = resp;
			},
			error: err => {
				console.error(err);

			}
		});
	}

	countiesSub?: Subscription;
	counties: any[] = [];

	getCounties() {
		this.accountManagersSub = this.litemoreService.getCounties().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.counties = resp;
			},
			error: err => {
				console.error(err);

			}
		});
	}

	schoolTypesSub?: Subscription;
	school_types: any[] = [];

	getSchoolTypes() {
		this.schoolTypesSub = this.litemoreService.getSchoolTypes().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.school_types = resp;
			},
			error: err => {
				console.error(err);

			}
		});
	}

	genderTypesSub?: Subscription;
	gender_types: any[] = [];

	getGenderTypes() {
		this.genderTypesSub = this.litemoreService.getGenderTypes().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.gender_types = resp;
			},
			error: err => {
				console.error(err);

			}
		});
	}

	initiateSchoolEdit(s: any, status: any) {
		s.edit = status;
		if (!status) {
			s.county_edit = false;
			s.contact_edit = false;
		}
	}

	updateSchoolCountySub?: Subscription;

	updateSchoolCounty(school: any, remove: any) {
		let new_county_name = "";
		const data: any = {};
		data.schoolid = parseInt(school.schoolid);
		data.remove = remove;
		if (!remove && school.county_temp != undefined && school.county_temp != null && school.county_temp.countyid != undefined) {
			data.countyid = parseInt(school.county_temp.countyid);
			new_county_name = school.county_temp.name;
		}

		// console.log("Update school county:", data, new_county_name);

		this.updateSchoolCountySub = this.litemoreService.updateSchoolCounty(data).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				school.county = new_county_name;
				this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.updateSchoolCountySuccess"));
				school.county_edit = false;
			},
			error: err => {
				console.error(err);
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
			}
		});
	}

	updateSchoolAccountManagerSub?: Subscription;

	updateSchoolAccountManager(school: any, remove: any) {
		let new_accountmanager_name = "";
		const data: any = {};
		data.schoolid = parseInt(school.schoolid);
		data.remove = remove;
		if (!remove && school.account_manager_temp != undefined && school.account_manager_temp != null && school.account_manager_temp.managerid != undefined) {
			data.managerid = parseInt(school.account_manager_temp.managerid);
			new_accountmanager_name = school.account_manager_temp.name;
		}

		// console.log("Update school account manager:", data, new_accountmanager_name);

		this.updateSchoolAccountManagerSub = this.litemoreService.updateSchoolAccountManager(data).subscribe({
			next: (resp: any) => {
				console.log(resp);

				school.account_manager = new_accountmanager_name;
				this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.updateSchoolAccountManagerSuccess"));
				school.account_manager_edit = false;
			},
			error: err => {
				console.error(err);
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
			}
		});

	}

	updateSchoolAccountOwnerSub?: Subscription;

	updateSchoolAccountOwner(school: any, remove: any) {
		let new_accountowner_name = "";
		const data: any = {};
		data.schoolid = parseInt(school.schoolid);
		data.remove = remove;
		if (!remove && school.account_owner_temp != undefined && school.account_owner_temp != null && school.account_owner_temp.managerid != undefined) {
			data.managerid = parseInt(school.account_owner_temp.managerid);
			new_accountowner_name = school.account_owner_temp.name;
		}

		// console.log("Update school account owner:", data, new_accountowner_name);

		this.updateSchoolAccountOwnerSub = this.litemoreService.updateSchoolAccountOwner(data).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				school.account_owner = new_accountowner_name;
				this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.updateSchoolAccountOwnerSuccess"));
				school.account_owner_edit = false;
			},
			error: err => {
				console.error(err);
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
			}
		});

	}

	showItem(item_type: any) {
		if (item_type == 1) {
			this.dataoptions.verified_isCurrent = true;
			this.dataoptions.joint_isCurrent = true;
			this.dataoptions.unverified_isCurrent = false;
			if (!this.dataoptions.verified_firstShown) {
				this.dataoptions.verified_firstShown = true;
			}
			if (this.school_details.complete) {
				this.school_details.complete = false;
			}
		} else if (item_type == 2) {
			this.dataoptions.verified_isCurrent = false;
			this.dataoptions.joint_isCurrent = false;
			this.dataoptions.unverified_isCurrent = true;

			if (!this.dataoptions.unverified_firstShown) {
				this.dataoptions.unverified_firstShown = true;
			}

		} else if (item_type == 10) {
			this.dataoptions.verified_isCurrent = false;
			this.dataoptions.unverified_isCurrent = false;
			this.dataoptions.joint_isCurrent = true;
			if (!this.dataoptions.joint_firstShown) {
				this.dataoptions.joint_firstShown = true;
			}

		}

	}

	verify_ss_School(school: any) {
		this.school_details.complete = true;

		// console.log("School:", school)

		this.ss_school.name = school.name;
		this.ss_school.county = school.county;
		this.ss_school.schoolid = school.schoolid;
		this.ss_school.contactPersonName = school.contact_person_name;
		this.ss_school.contactPersonPhone = school.contact_person_phone;

		this.registerSchoolForm.reset();

		this.registerSchoolForm.patchValue({
			schoolName: school.name,
			county: school.county,
			contactPersonName: school.contact_person_name,
			contactPersonPhone: school.contact_person_phone,
		});
	}

	rejectSchoolSub?: Subscription;

	rejectSchool(school: any) {
		Swal.fire({
			title: this.translate.instant("litemore.selfSignup.swal.rejectSchoolTitle", { schoolName: school.name }),
			text: this.translate.instant("litemore.selfSignup.swal.rejectSchoolText"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				// console.log("Reject school with id:", school.schoolid);

				this.rejectSchoolSub = this.litemoreService.rejectSchool(school.schoolid).subscribe({
					next: (resp: any) => {
						// console.log(resp);

						if (resp.responseCode == 200) {
							this.ss_school = {};
							this.school_details.complete = false;

							this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.rejectSchoolSuccess"));

							this.getUnverifiedSchools(this.user_init);
							this.dataoptions.verified_isCurrent = true;
							this.dataoptions.unverified_isCurrent = false;

						}

					},
					error: err => {
						console.error(err);

						if (err.responseCode == 422) {
							this.error_msg = err.message;
							if (err.responseCode_item == 1) {
								this.error_registration = true;
							} else if (err.responseCode_item == 2) {
								this.error_email = true;
							} else if (err.responseCode_item == 3) {
								this.error_partner = true;
							}
						}

						this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
					}
				});
			}
		});
	}

	verifySelfSignUpSchoolSub?: Subscription;

	verifySelfSignUpSchool(school: any) {
		// console.log("Verify school:", school.schoolid);

		this.verifySelfSignUpSchoolSub = this.litemoreService.verifySelfSignUpSchool(school.schoolid).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.verifySelfSignUpSchoolSuccess"));

				this.router.navigate(["/litemore"]);
			},
			error: err => {
				console.error(err);
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
			}
		});
	}

	invalidateSchoolSub?: Subscription;

	invalidateSchool(school: any) {
		Swal.fire({
			title: this.translate.instant("litemore.selfSignup.swal.invalidateSchoolTitle", { schoolName: school.name }),
			text: this.translate.instant("litemore.selfSignup.swal.invalidateSchoolText"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				// console.log("Invalidate school:", school.schoolid);

				this.invalidateSchoolSub = this.litemoreService.invalidateUnverifiedSelfSignUpSchool(school.schoolid).subscribe({
					next: (resp: any) => {
						// console.log(resp);

						if (resp.responseCode == 200) {
							this.school_details.complete = false;

							this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.invalidateSchoolSuccess"));

							this.getVerifiedSchools(this.user_init);
							this.dataoptions.verified_isCurrent = true;
							this.dataoptions.unverified_isCurrent = false;

							this.router.navigate(["/litemore"]);

						}

					},
					error: err => {
						console.error(err);

						if (err.responseCode == 422) {
							this.error_msg = err.message;
							if (err.responseCode_item == 1) {
								this.error_registration = true;
							} else if (err.responseCode_item == 2) {
								this.error_email = true;
							} else if (err.responseCode_item == 3) {
								this.error_partner = true;
							}
						}

						this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
					}
				});
			}
		});
	}

	population: any = {};
	register_ss_School_sub?: Subscription;

	register_ss_School() {
		this.initBooleans();

		const form = this.registerSchoolForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const schoolName = form.value["schoolName"];

		const payload: any = {
			contactPersonName: form.value["contactPersonName"],
			contactPersonPhone: form.value["contactPersonPhone"],
			county: form.value["county"],
			name: form.value["schoolName"],
			schoolid: this.ss_school.schoolid,
			genderType: form.value["genderType"],
			schoolType: form.value["schoolType"],
			registration: form.value["schoolCode"],
			email: form.value["email"],
			phone: form.value["phoneNumber"],
			accountManager: form.value["accountManager"],
		};

		this.population.category = form.value["schoolPopulationCategory"];

		// console.log("Register ss school:", this.ss_school);
		// console.log("Register ss school payload:", payload);
		// console.log("Register ss school population:", this.population);

		this.register_ss_School_sub = this.litemoreService.register_ss_School(payload, this.population).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				if (resp.responseCode == 200) {
					this.ss_school = {};
					// this.registerSchoolForm.reset();
					this.school_details.complete = false;

					this.getVerifiedSchools(this.user_init);
					this.getUnverifiedSchools(this.user_init);
					this.dataoptions.verified_isCurrent = true;
					this.dataoptions.unverified_isCurrent = false;

					this.toast.success(this.translate.instant("litemore.selfSignup.toastMessages.registerSchoolSuccess"));
				}
			},
			error: err => {
				console.error(err);

				if (err.responseCode == 422) {
					this.error_msg = err.message;
					if (err.responseCode_item == 1) {
						this.error_registration = true;
					} else if (err.responseCode_item == 2) {
						this.error_email = true;
					} else if (err.responseCode_item == 3) {
						this.error_partner = true;
					}
				}

				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

}
