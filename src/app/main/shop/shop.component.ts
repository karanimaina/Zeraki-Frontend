import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-shop",
	templateUrl: "./shop.component.html",
	styleUrls: ["./shop.component.scss"]
})
export class ShopComponent implements OnInit {

	user_info: any = {};
	user_init: any = {};
	params: any;

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private userService: UserService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit(): void {
		this.loadUserInfo();
		this.loadUserInit();
		this.route.params.subscribe((param: any) => {
			this.params = param;
			this.init();
		});
	}

	loadUserInfo() {
		this.userService.userInfoSubject.subscribe(
			(res) => {
				this.user_info = res;
			}
		);
	}

	loadUserInit() {
		this.dataService.userInitSubject.subscribe(
			(res) => {
				this.user_init = res;
			});
	}

	zerakiShop() {
		if (this.user_info === undefined || this.user_info.personalEmail === undefined || this.user_info.personalEmail === null) {
			let fieldName: any;
			if (this.user_init.isStudent) {
				fieldName = this.translate.instant("shop.swal.fieldName");
			} else {
				fieldName = this.translate.instant("shop.swal.fieldName2");
			}
			Swal.fire({
				title: this.translate.instant("shop.swal.title"),
				text: this.translate.instant("shop.swal.text", { fieldName }),
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("shop.swal.confirmButtonText"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			}).then((response) => {
				if (response.isConfirmed) {
					if (this.user_init.isStudent) {
						this.router.navigate(["main/students/prof", this.user_info?.userid]);
						// $state.go("home.student.profile", { userid: this.user_info.userid });
					} else {
						// $state.go("home.admin.update_teacher")
						this.router.navigate(["main/settings/my-prof"]);
					}
				}
			});


		} else if (this.user_info.personalEmailStatus === undefined || this.user_info.personalEmailStatus === null || this.user_info.personalEmailStatus === 1) {
			//The confirmation email has not been sent
			Swal.fire({
				title: this.translate.instant("shop.swal.title2"),
				text: this.translate.instant("shop.swal.text2"),
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
			}).then((response) => {
				if (response.isConfirmed) {
					const url = "/shop/email";
					this.examService.doPostNoParams(url).subscribe(
						(res) => {
							this.loadUserInfo();
							Swal.fire({
								title: res.response.title,
								text: res.response.message,
								icon: "success",
							});
						}, (err) => {
							Swal.fire({
								title: this.translate.instant("shop.swal.title3"),
								text: this.translate.instant("shop.swal.text3"),
								icon: "error",
							});
						}, () => {

						}
					);

				}
			});
		} else if (this.user_info.personalEmailStatus === 2) {
			//The confirmation email has been sent but the confirmation link has not been clicked
			Swal.fire({
				// title: "Email Not Confirmed",
				// text: "We sent an email to " + this.user_info.personalEmail + ". Kindly click on the link to confirm your email. \n\nDid not get the confirmation email? Click Resend Email",
				title: this.translate.instant("shop.swal.title4"),
				text: this.translate.instant("shop.swal.text4", { email: this.user_info.personalEmail }),
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("shop.swal.confirmButtonText4"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
			}).then((response) => {
				if (response.isConfirmed) {
					const url = "/shop/email";
					this.examService.doPostNoParams(url).subscribe(
						(res) => {
							this.loadUserInfo();
							Swal.fire({
								title: res.response.title,
								text: res.response.message,
								icon: "success",
							});
						}, (err) => {
							Swal.fire({
								title: err.error.response.title,
								text: err.error.response.message,
								icon: "error",
							});
						}
					);
				}
			});
		} else {

			const url = "/shop/customer";
			this.examService.doPostNoParams(url).subscribe(
				(res) => {
					window.open(res.loginURL, "_blank");

				}, (err) => {
					Swal.fire({
						title: err.error.response.title,
						text: err.error.response.message,
						icon: "error",
					});
				}, () => { });
		}
	}

	init() {
		if (!(this.params == undefined || this.params == null || this.params.params.length < 3)) {
			const url = `api/mail/${this.params.params}`;
			this.examService.doGet(url).subscribe(
				(res) => {
					Swal.fire({
						title: res.hashMap.response.title,
						icon: "success",
						text: res.hashMap.response.message
					});
					this.loadUserInfo();
				}, (err) => {
					Swal.fire({
						title: err.error.hashMap.response.title,
						text: err.error.hashMap.response.message,
						icon: "error"
					});
				}
			);
		}
	}



}
