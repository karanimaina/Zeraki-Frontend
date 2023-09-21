import { HttpEventType } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Role } from "src/app/@core/models/Role";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { phoneNumberValidator } from "src/app/@core/shared/directives/phone-validator.directive";
import { environment } from "src/environments/environment";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { SettingsService } from "src/app/@core/services/settings/settings.service";

@Component({
	selector: "app-school-profile",
	templateUrl: "./school-profile.component.html",
	styleUrls: ["./school-profile.component.scss"]
})
export class SchoolProfileComponent implements OnInit {
	schoolProfile!: SchoolInfo;
	genderTypes: any;
	boardingTypes: any;
	teachers: any;
	titles: any[] = [];
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	school_logo_path: any;
	progressPercentage?: number;
	schoolProfileForm!: SubmitFormGroup;

	constructor(
		private dataService: DataService,
		private settingsService: SettingsService,
		private messagingService: MessagingService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private rolesService: RolesService,
		private schoolService: SchoolService,
		private responseHandler: ResponseHandlerService) { }

	ngOnInit(): void {
		this.initItems();
		this.getSchoolProfile();
		forkJoin([
			this.settingsService.getBoardingStatus().pipe(catchError(e => of(e))),
			this.settingsService.getGenderTypes().pipe(catchError(e => of(e))),
			this.settingsService.getHeadTitles().pipe(catchError(e => of(e))),
			this.messagingService.getTeachers().pipe(catchError(e => of(e))),
		]).subscribe(([boardingTypes, genderTypes, titles, teachers]) => {
			// TODO: Get translated boardingTypes from backend. Hardcorded for now on function setBoardingStatus()
			// this.boardingTypes = boardingTypes;
			this.setBoardingStatus();

			// TODO: Get translated genderTypes from backend. Hardcorded for now on function setGenderTypes()
			// this.genderTypes = genderTypes;
			this.setGenderTypes();

			this.titles = titles;
			this.teachers = teachers;
		});
	}

	setBoardingStatus() {
		this.boardingTypes = [
			{
				name: this.translate.instant("settings.schoolInfoProfile.boardingStatus.mixed"),
				value: "Mixed"
			},
			{
				name: this.translate.instant("settings.schoolInfoProfile.boardingStatus.day"),
				value: "Day"
			},
			{
				name: this.translate.instant("settings.schoolInfoProfile.boardingStatus.boarding"),
				value: "Boarding"
			},
		];
	}

	setGenderTypes() {
		this.genderTypes = [
			{
				name: this.translate.instant("settings.schoolInfoProfile.genderType.boys"),
				code: 1,
				value: "Boys School"
			},
			{
				name: this.translate.instant("settings.schoolInfoProfile.genderType.girls"),
				code: 2,
				value: "Girls School"
			},
			{
				name: this.translate.instant("settings.schoolInfoProfile.genderType.mixed"),
				code: 3,
				value: "Mixed School"
			},
		];
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe({
			next: (resp: any) => {
				this.schoolProfile = resp;
				this.setSchoolLogo(this.schoolProfile?.logo);
				this.initializeSchoolProfileForm();
			},
		});
	}

	private setSchoolLogo(imageName: any) {
		if (imageName) {
			if (imageName.includes("http")) {
				this.school_logo_path = imageName;
			} else {
				this.school_logo_path = environment.apiurl + "/groups/images/" + imageName;
			}
		}
	}

	private initializeSchoolProfileForm() {
		this.schoolProfileForm = new SubmitFormGroup({
			name: new FormControl(this.schoolProfile?.name, [Validators.required]),
			shortName: new FormControl(this.schoolProfile?.shortName, [Validators.required, Validators.maxLength(15)]),
			phone: new FormControl(this.schoolProfile?.phone, [Validators.required, phoneNumberValidator]),
			email: new FormControl(this.schoolProfile?.email, [Validators.required, Validators.email]),
			principalId: new FormControl(this.schoolProfile?.principal?.userid, Validators.required),
			headTeacherTitle: new FormControl(this.schoolProfile?.principal?.title, Validators.required),
			deputyPrincipalId: new FormControl(this.schoolProfile?.deputyPrincipal?.userid),
			dosId: new FormControl(this.schoolProfile?.dos?.userid, Validators.required),
			address: new FormControl(this.schoolProfile?.address, Validators.required),
			genderType: new FormControl(this?.schoolProfile?.genderType, Validators.required),
			boardingStatus: new FormControl(this.schoolProfile?.boardingStatus, Validators.required),
			logoFile: new FormControl(""),
		});
	}

	get name() { return this.schoolProfileForm.get("name"); }
	get shortName() { return this.schoolProfileForm.get("shortName"); }
	get phone() { return this.schoolProfileForm.get("phone"); }
	get email() { return this.schoolProfileForm.get("email"); }
	get principal() { return this.schoolProfileForm.get("principalId"); }
	get deputyPrincipal() { return this.schoolProfileForm.get("deputyPrincipalId"); }
	get headTitle() { return this.schoolProfileForm.get("headTeacherTitle"); }
	get hodAcademics() { return this.schoolProfileForm.get("dosId"); }
	get address() { return this.schoolProfileForm.get("address"); }
	get genderType() { return this.schoolProfileForm.get("genderType"); }
	get boardingStatus() { return this.schoolProfileForm.get("boardingStatus"); }
	get logoFile() { return this.schoolProfileForm.get("logoFile"); }


	updateSchoolProfile(): void {
		this.initItems();
		const updatedSchoolProfile = this.schoolProfileForm.value;
		updatedSchoolProfile.headTeacherTitle = this.titles.find((title) => title.title == updatedSchoolProfile.headTeacherTitle)?.code;

		this.schoolService.updateSchool(updatedSchoolProfile).subscribe({
			next: () => {
				const message = this.translate.instant("settings.schoolInfoProfile.toastMessages.updateSuccess");
				this.toastService.success(message);
			},
			error: (err: any) => {
				const consoleError = `updateSchool() >> ${err}`;
				this.responseHandler.error(err, consoleError);
			},
			complete: () => {
				this.schoolService.setSchoolInfo();
				this.rolesService.setUserRoles();
			}
		});
	}


	uploadLogo(file: any) {
		this.initItems();
		file = file.target.files[0];
		if (file) {

			/** Limit upload size to 1mb */
			const maximumSize = 1; // Maximum file size in megabytes
			const fileSize = (file.size / 1024) / 1024;
			if (fileSize > maximumSize) {
				this.toastService.info(this.translate.instant("common.maximumFilesize", { maxsize: `${maximumSize}mb` }));
				this.schoolProfileForm.patchValue({
					logoFile: ""
				});
				return;
			}

			const url = environment.apiurl + "/groups/school/update/logo";
			this.dataService.sendFile2({ file: file }, url)
				.subscribe({
					next: (resp: any) => {
						this.initItems();
						if (resp.type == HttpEventType.UploadProgress) {
							this.progressPercentage = Math.round(100 * (resp.loaded / (resp.total || 0)));
							// //console.warn(`File ${i} progress >> `, file.progress);
						}
						this.schoolService.setSchoolInfo();
						// this.setSchoolLogo(resp.data.description);
						//console.log(resp.message);

						const message = this.translate.instant("settings.schoolInfoProfile.toastMessages.updateLogoSuccess");
						this.toastService.success(message);
					},
					error: error => {
						this.responseHandler.error(error, "uploadLogo()");
					}
				});
		} else {
			this.schoolProfileForm.patchValue({
				logoFile: ""
			});
		}
	}

	initItems() {
		this.progressPercentage = 0;
	}

}
