import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { environment } from "src/environments/environment";

@Component({
	selector: "app-school",
	templateUrl: "./school.component.html",
	styleUrls: ["./school.component.scss"]
})
export class SchoolComponent implements OnInit, OnDestroy {

	isLoading = false;
	avatar_url: any;
	show_auth_reset_view = false;
	require_auth_reset = false;
	suspension: any = {
		isSuspended: false,
		message: "",
		title: ""
	};
	user_init: any;
	reset: any = {};
	initialSetupDone = false;
	error_msg = "";
	userSubscription?: Subscription;
	setupSubscription?: Subscription;

	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private router: Router,
		private translate: TranslateService,
		private toastService: HotToastService) { }

	ngOnDestroy(): void {
		this.userSubscription?.unsubscribe();
		this.setupSubscription?.unsubscribe();
	}

	ngOnInit(): void {
		this.getUserInit();
	}

	getUserInit() {
		this.userSubscription = this.dataService.getUserInit().subscribe(resp => {
			this.user_init = resp;
			if (this.user_init?.suspension != null && this.user_init?.suspension?.isSuspended != null && this.user_init?.suspension?.isSuspended) {
				this.suspension.isSuspended = true;
				this.suspension.message = this.user_init?.suspension.message;
				this.suspension.title = this.user_init?.suspension.title;
			}
			this.setupSubscription = this.dataService.initialSetupDone().subscribe((resp: any) => {
				this.initialSetupDone = resp;
				if (this.initialSetupDone) {
					if (!this.suspension.isSuspended && !this.require_auth_reset) {
						this.directUser();
					}
				} else {
					// $state.go("backup");
				}
			});
		});
	}

	getImage(image_path: any) {
		if (image_path === undefined || image_path === null) {
			return this.avatar_url;
		} else if (image_path.includes("http") || image_path.includes(this.avatar_url)) {
			return image_path;
		} else {
			image_path = environment.apiurl + "/groups/images/" + image_path;
			return image_path;
		}
	}

	getSchoolTypeClass(schooltype: any) {
		if (schooltype.toLowerCase() == "kcse") {
			return "badge-info";
		} else if (schooltype.toLowerCase() == "igcse") {
			return "badge-success";
		} else {
			return "badge-warning";
		}
	}

	directUser() {
		if (this.user_init?.role == 300) {
			// $state.go("home.partner");
		} else if (this.user_init?.role == 200) {
			// $state.go("home.joint");
		} else if (this.user_init?.role >= 100 && this.user_init?.role < 200) {
			// $state.go("litemore");
			this.router.navigate(["/litemore"]);
		} else if (this.user_init?.isStudent) {
			// STUDENT NEVER GETS HERE
			// $state.go("home.analytics.student", { userid: "" });
		} else {
			if (this.user_init?.schools?.length === 0) {
				this.router.navigate(["/main"]);
			} else {
				if (this.user_init?.schools != null && this.user_init?.schools?.length > 0) {
					this.user_init?.schools.forEach(school => {
						school.logo = this.getImage(school.logo);
					});
				}
			}
		}
	}

	initUser(schoolid: any) {
		if (!this.suspension.isSuspended && !this.require_auth_reset) {
			this.authService.switchSchool(schoolid).subscribe({
				// next: resp => {
				// 	console.warn(resp);

				// },
				error: err => {
					console.error(err);
					this.error_msg = this.translate.instant("common.toastMessages.anErrorOccurred");
					if (err.message !== undefined) {
						this.error_msg = err.message;
					}
					this.toastService.warning(this.error_msg);
				},
				complete: () => {
					this.router.navigate(["/main"]);
				}
			});
		}
	}

	// initResetCode() {
	// 	this.error_reset = false;
	// 	this.error_reset_msg = "";
	// 	this.request_code_success_msg = "";
	// 	this.reset_code_received = undefined;
	// 	this.reset_password_success = false;
	// }

	// changePasswordHome() {
	// 	this.error_reset = false;
	// 	this.error_reset_msg = "";
	// 	this.reset_code_received = undefined;
	// 	this.reset = {};
	// }

}
