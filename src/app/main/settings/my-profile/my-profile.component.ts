import { HttpEventType } from "@angular/common/http";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormGroup, NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { UserInfo } from "src/app/@core/models/user-info";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeCheckerService } from "src/app/@core/shared/services/school/school-type-checker/school-type-checker.service";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { Language, LanguageCode, languageList } from "src/app/@core/shared/utilities/site-language";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";

@Component({
	selector: "app-my-profile",
	templateUrl: "./my-profile.component.html",
	styleUrls: ["./my-profile.component.scss"]
})
export class MyProfileComponent implements OnInit {
	@ViewChild("fileUpload") fileUploadBtn!: ElementRef;
	@ViewChild("fileUpload_signature") fileUploadBtnSignature!: ElementRef;
	userInfo: UserInfo = new UserInfo();
	showLogo = false;
	logoFile: any = {};
	sigFile: any = {};

	update_profile_success_status = false;
	error = false;
	error_msg: any;

	image_path_signature: any;
	image_path: any;
	showLogo_signature = true;
	progressPercentage: any;
	showUploadSection = false;
	showUploadSection_signature = false;

	isDisabled = !true;
	groups = ["Group 1", "Group 2", "Group 3"];
	selectedPeople = [];
	gender = "";
	isChecked?: boolean;
	theme = "";
	teacherGroup: any;
	teacherGroupMap = new Map();
	uploadingImage = {
		logo: false,
		signature: false
	};

	constructor(
		private dataService: DataService,
		private userService: UserService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private siteLanguageService: SiteLanguageService,
		public schoolTypeChecker: SchoolTypeCheckerService,
	) {
		const zerakiTheme = JSON.parse(localStorage.getItem("zeraki_theme") || "{}");
		if (zerakiTheme === "dark") {
			this.isChecked = true;
		} else {
			this.isChecked = false;
		}
	}

	ngOnInit(): void {
		this.getUserInfo(false, true);
		this.initItems();
		this.logoFile.img = null;
		this.sigFile.img = null;
	}

	storeTheme() {
		if (this.isChecked) {
			this.theme = "dark";
		} else {
			this.theme = "light";
		}
		localStorage.setItem("zeraki_theme", JSON.stringify(this.theme));
	}

	getUserInfo(update = false, init = false) {
		if (init) {
			this.userService.userInfoSubject.subscribe(resp => {
				this.userInfo = resp;

				if (this.userInfo?.url && this.userInfo?.url.length > 0) {
					this.setLogo(this.userInfo?.url);
				}

				if (this.userInfo?.signature && this.userInfo?.signature.length > 0) {
					this.setLogo_signature(this.userInfo?.signature);
				}
			});
		} else {
			this.userService.userInfoSubject.subscribe({
				next: (resp: any) => {
					this.userInfo = resp;
					if (update) {
						this.updateImagePath();
					}
				},
			});
		}
	}

	isUpdating = false;
	updateTeacherProfile(ngForm: NgForm) {
		const form: FormGroup = ngForm.form;
		// Remove control of type file because it has already been uploaded
		form.removeControl("file");

		if (ngForm.invalid) {
			const message = this.translate.instant("common.invalidForm");
			this.toastService.error(message);
			return;
		}
		this.initItems();

		const userObject = {
			name: this.userInfo?.name,
			phone: this.userInfo?.phone,
			personalEmail: this.userInfo?.personalEmail,
			gender: this.userInfo?.gender,
			tscNo: this.userInfo?.tscNo,
			nationalIdNo: this.userInfo?.nationalIdNumber,
			biography: this.userInfo?.biography,
		};

		const url = "users/teacher/updateprofile/-1";
		this.isUpdating = true;
		this.dataService.send(userObject, url).subscribe({
			next: (resp: any) => {
				console.warn(resp);
				this.update_profile_success_status = true;

				console.log(resp.message);
				const message = this.translate.instant("settings.userProfile.toastMessages.updateTeacherProfileSuccess");
				this.toastService.success(message);
				this.isUpdating = false;
			},
			error: err => {
				this.error = true;
				this.error_msg = this.translate.instant("common.toastMessages.anErrorOccurred");
				if (err.error.response.message !== undefined) {
					console.error(err.error.response.message);
				}
				this.toastService.error(this.error_msg);
				this.isUpdating = false;
			},
			complete: () => {
				this.userService.setUserInfo();
				this.getUserInfo(true);
			}
		});
	}

	deleteProfilePic() {
		const params = "?profpic=true";
		this.deletePhoto(params, true, false);
	}

	deleteSignature() {
		const params = "?signature=true";
		this.deletePhoto(params, false, true);
	}

	deletePhoto(params: string, isProfPic: boolean, isSignature: boolean) {
		if (isProfPic == true || isSignature == true) {
			let title = "";
			let text = "";
			if (isProfPic) {
				title = this.translate.instant("settings.userProfile.swal.title1");
				text = this.translate.instant("settings.userProfile.swal.text1");
			} else if (isSignature) {
				title = this.translate.instant("settings.userProfile.swal.title2");
				text = this.translate.instant("settings.userProfile.swal.text2");
			}
			Swal.fire({
				title: title,
				text: text,
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
				cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
			}).then((result) => {
				if (result.isConfirmed) {
					const url = "groups/delete/photo" + params;
					this.dataService.deleteObject(url).subscribe({
						next: () => {
							this.initItems();
							if (isSignature) {
								this.showLogo_signature = false;
							} else if (isProfPic) {
								this.showLogo = false;
							}

							const message = (isSignature) ? this.translate.instant("settings.userProfile.toastMessages.deleteSignaturSuccess") : this.translate.instant("settings.userProfile.toastMessages.deletePhotoSuccess");
							this.toastService.success(message);
						},
						error: err => {
							const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred");
							const error = errorMsg;
							if (err != null && err.message != null) {
								console.log(err.message);
							}

							this.toastService.error(error);
						},
						complete: () => {
							this.userService.setUserInfo();
							this.getUserInfo(true);
						}
					});
				}
			});
		}
	}

	setLogo(image_name: any) {
		if (image_name !== undefined && image_name !== null) {
			if (image_name.includes("http")) {
				this.image_path = image_name;
			} else {
				this.image_path = environment.apiurl + "/groups/images/" + image_name;
			}
		}
		this.showLogo = true;
	}

	setLogo_signature(image_name: any) {
		if (image_name !== undefined && image_name !== null) {
			if (image_name.includes("http")) {
				this.image_path_signature = this.userInfo?.signature;// image_name;
			} else {
				this.image_path_signature = this.userInfo?.signature;
			}
		}
		this.showLogo_signature = true;
	}

	uploadLogo(file: any, isSignature: boolean, ngForm: NgForm) {
		file = file.target.files[0];
		const form: FormGroup = ngForm.form;
		if (form.controls["file"].invalid) {
			this.toastService.error(this.translate.instant("settings.userProfile.toastMessages.invalidFileType"));
			form.controls["file"].setValue(null);
			return;
		} else if (!form.controls["file"].value) {
			return;
		}
		this.initItems();
		if (file) {
			/** Limit upload size to 1mb */
			const maximumSize = 1; // Maximum file size in megabytes
			const fileSize = (file.size / 1024) / 1024;
			if (fileSize > maximumSize) {
				this.toastService.info(this.translate.instant("common.maximumFilesize", { maxsize: `${maximumSize}mb` }));
				this.sigFile.img = "";
				return;
			}

			let url = environment.apiurl + "/groups/teacher/update/photo";
			if (isSignature) {
				this.showUploadSection_signature = true;
				this.uploadingImage.signature = true;
				url = url + "?signature=" + true;
			} else {
				this.showUploadSection = true;
				this.uploadingImage.logo = true;
			}
			this.dataService.uploadSig({ file: file }, url)
				.subscribe({
					next: (resp: any) => {
						this.uploadingImage.logo = false;
						this.uploadingImage.signature = false;
						form.controls["file"].setValue(null);

						this.initItems();
						if (isSignature) {
							this.setLogo_signature(resp.description);
						} else {
							this.setLogo(resp.description);
						}
						if (resp.type == HttpEventType.UploadProgress) {
							this.progressPercentage = Math.round(100 * (resp.loaded / (resp.total || 0)));
						}
						console.log(resp.message);

						const message = (isSignature) ? this.translate.instant("settings.userProfile.toastMessages.updateSignatureSuccess") : this.translate.instant("settings.userProfile.toastMessages.updateLogoSuccess");
						this.toastService.success(message);
					},
					error: error => {
						this.error = true;
						this.uploadingImage.logo = false;
						this.uploadingImage.signature = false;
						form.controls["file"].setValue(null);

						this.error_msg = this.translate.instant("common.toastMessages.anErrorOccurred");
						if (error.message !== undefined) {
							console.log(error.message);
						}
					},
					complete: () => {
						this.userService.setUserInfo();
						this.getUserInfo(true);
					}
				});
		} else {
			this.logoFile.img = null;
			this.sigFile = null;
		}
	}

	initItems() {
		this.showUploadSection = false;
		this.showUploadSection_signature = false;
		this.update_profile_success_status = false;
		this.error = false;
		this.error_msg = "";
		this.progressPercentage = 0;
	}

	updateImagePath() {
		this.image_path = this.dataService.getUserImage();
		if (this.userInfo && this.userInfo?.url && this.userInfo?.url.length > 0) {
			this.image_path = this.dataService.getUserImage(this.userInfo?.url);
		}
	}

	changeImageBtnClick() {
		this.fileUploadBtn.nativeElement.click();
	}

	changeSignatureBtnClick() {
		this.fileUploadBtnSignature.nativeElement.click();
	}

	/* Language Selection */
	readonly languages = [...languageList];

	get currentLanguage(): Language | null {
		return this.siteLanguageService.getCurrentLanguage();
	}

	switchLanguage(localeCode: LanguageCode) {
		this.siteLanguageService.changeSiteLanguage(localeCode);
	}

}
