import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
	templateUrl: "./reset-code.component.html",
	styleUrls: ["./reset-code.component.scss"]
})
export class ResetCodeComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	searchResetCodeForm = this.fb.group({
		schoolID: [null, Validators.required],
		schoolCode: [""],
		username: ["", Validators.required],
	});

	get schoolID(): AbstractControl | null {
		return this.searchResetCodeForm.get("schoolID");
	}
	get schoolCode(): AbstractControl | null {
		return this.searchResetCodeForm.get("schoolCode");
	}
	get username(): AbstractControl | null {
		return this.searchResetCodeForm.get("username");
	}

	requiredValidator = Validators.required;

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	constructor(
    private fb: FormBuilder,
    private litemoreUserService: LitemoreUserService,
    private litemoreService: LitemoreService,
    private toastService: HotToastService,
	private translate:TranslateService
	) { }

	ngOnInit(): void {
		this.refetchAccountManagerSchools();

		this.searchResetCodeForm.get("schoolCode")?.disable();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	loggedInUser$?: Observable<LitemoreUser1> = this.litemoreUserService.litemoreUser$;

	fetchInProgress = false;
	data: any = {
		reset_code_schools: [],
	};

	refetchAccountManagerSchools() {
		this.fetchInProgress = true;

		this.litemoreService.getAccountManagerSchools().pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.data = resp;
				this.fetchInProgress = false;
			},
			error: (err: any) => {
				console.log(err);

			},
		});

	}

	error_msg_reset: any;
	reset_code_data: any = {};

	searchResetCode() {
		const form = this.searchResetCodeForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const payload: any = {
			schoolid: form.value["schoolID"],
			username: form.value["username"]
		};

		// console.log("payload:", payload);

		this.reset_code_data.response = {};

		this.litemoreService.searchResetCode(payload).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				console.log(resp);

				this.reset_code_data.response = resp;

				if (resp.email == null) {
					this.toastService.warning(this.translate.instant('litemore.bdevs.resetCode.noUserFound'));
				} else if (resp.reset_code == null) {
					this.toastService.warning(this.translate.instant('litemore.bdevs.resetCode.noResetCodeFound'));
				} else {
					this.toastService.success(this.translate.instant('litemore.bdevs.resetCode.resetCodeFound'));
				}

			},
			error: (err: any) => {
				// console.log(err);

				if (err.message === undefined) {
					this.error_msg_reset = this.translate.instant('litemore.bdevs.resetCode.anErrorOccurred');
				} else {
					this.error_msg_reset = err.message;
				}
				this.toastService.warning(this.error_msg_reset);
			},
		});

	}

	prefillSchoolCode(school: any) {
		// console.log(school);

		this.searchResetCodeForm.patchValue({
			schoolCode: school.registration,
		});
	}

}
