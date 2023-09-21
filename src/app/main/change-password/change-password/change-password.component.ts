import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";

@Component({
	selector: "app-change-password",
	templateUrl: "./change-password.component.html",
	styleUrls: ["./change-password.component.scss"]
})
export class ChangePasswordComponent implements OnInit {

	loggedUser: any;

	showForm = false;
	showSuccess = false;
	reset_code_received = false;
	request_code_success_msg: any;
	error_reset_msg = "";
	error_reset = false;
	reset_password_success = false;

	constructor(
    private dataService: DataService,
    private toastService: HotToastService,
    private translate: TranslateService,
	private userService: UserService
	) { }

	ngOnInit(): void {
		this.userService.userInfoSubject.subscribe(r => { this.loggedUser = r; });
	}

	requestResetCode() {
		const url = "users/resetpassword";
		this.dataService.get(url).subscribe((res: any) => {
			this.request_code_success_msg = res.message;
			this.reset_code_received = true;
			this.showForm = true;
			this.showSuccess = true;
		}, (resp: any) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");

			if (resp.error.message == undefined) {
				this.error_reset_msg = message;
				this.error_reset = true;
			} else {
				console.log(resp.error.message);
				this.error_reset_msg = resp.error.message;
				this.error_reset = true;
			}
		});
		// liteService.get("api/users/resetpassword").then(function (resp) {
		//   if (resp.data.responseCode !== undefined && resp.data.responseCode == 200) {

		//   }
		// }).catch(function (resp) {

		// });
	}
	changePassword(form: NgForm) {
		// console.log(form);
		if (form.invalid || form.controls.code.value.trim() == "") {
			const message = this.translate.instant("common.invalidForm");
			this.toastService.error(message);
			return;
		}
		const f = form.value;
		// console.log(f);
		this.error_reset = false;
		this.error_reset_msg = "";
		if (f.password.length < 5) {
			this.error_reset = true;
			const message = this.translate.instant("changePassword.formErrors.passwordMinimum");
			this.error_reset_msg = message;
		} else if (f.password !== f.password2) {
			this.error_reset = true;
			const message = this.translate.instant("changePassword.formErrors.passwordsNotMatching");
			this.error_reset_msg = message;
		} else {
			const url = "users/changepassword?c=" + f.code + "&p=" + encodeURIComponent(f.password);
			this.dataService.get(url).subscribe(
				(res) => {
					this.reset_password_success = true;
					const message = this.translate.instant("changePassword.toastMessages.passwordChangeSuccess");
					this.request_code_success_msg = message;
					this.toastService.success(message);
				}, (err) => {
					const message = this.translate.instant("common.toastMessages.anErrorOccurred");

					if (err.error.message == undefined) {
						this.error_reset_msg = message;
					} else {
						console.log(err.error.message);
						this.error_reset_msg = message;
					}
					this.toastService.error(message);
				}
			);
			/*liteService.get().then(function (resp) {
          if (resp.data.responseCode !== undefined && resp.data.responseCode == 200) {

              directUser();
          }
      }).catch(function (resp) {
          $scope.error_reset = true;

      });*/
		}
	}



}
