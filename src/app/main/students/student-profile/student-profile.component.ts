import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import * as uuid from "uuid";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { FormBuilder, Validators } from "@angular/forms";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { Location } from "@angular/common";
import { SchoolTypes } from "src/app/@core/enums/school-types";
import { Student } from "src/app/@core/models/student/student";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { finalize, takeUntil } from "rxjs/operators";
import { BoardingStatus } from "src/app/@core/enums/boarding-status/boarding-status";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

@Component({
	selector: "app-student-profile",
	templateUrl: "./student-profile.component.html",
	styleUrls: ["./student-profile.component.scss"]
})
export class StudentProfileComponent implements OnInit, OnDestroy {
	readonly schoolTypes = SchoolTypes;

	destroy$: Subject<boolean> = new Subject<boolean>();
	routeId: any;
	student!: Student;
	form_streams: any;
	student_residences: any;

	logoFile: any = {};
	error_st = false;
	error_msg = "";
	wasStudentDeleted = false;
	showUploadSection = false;
	progressPercentage: any;
	custom_errors: any = [];
	rightSidebar = false;
	admit_student = false;
	showPhoto = false;
	image_path: any;
	userRoles!: any;
	schoolProfile: any;
	showLoading = false;

	houses: string[] = [];
	years: string[] = [];
	selectedYear = "";
	awaitingApproval = false;
	schoolTypeData?: SchoolTypeData;
	studentProfileForm = this.fb.group([]);
	generalCommentsLength!: number;
	loadingStudent = false;
	updatingProfile = false;

	new_student: any;
	selectedForm: any = {};
	selectForm: any;

	boardingStatuses = [
		{
			label: this.translate.instant(
				"settings.schoolInfoProfile.boardingStatus.day"
			),
			name: "Day",
			value: true
		},
		{
			label: this.translate.instant(
				"settings.schoolInfoProfile.boardingStatus.boarding"
			),
			name: "Boarding",
			value: false
		}
	];

	constructor(
		private studentsService: StudentsService,
		private dataService: DataService,
		private rolesService: RolesService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute,
		private schoolService: SchoolService,
		private _location: Location,
		private fb: FormBuilder
	) { }

	ngOnInit(): void {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});

		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");

		this.getUserRoles();
		this.getStudentsProfile();
		this.getSchoolProfile();
		this.getFormStreams();
		this.getStudentResidences();
		this.logoFile.img = null;
		this.showPhoto = false;
		this.image_path = this.dataService.getUserImage();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	getUserRoles() {
		this.rolesService.roleSubject.subscribe((userRoles) => {
			this.userRoles = userRoles;
		});
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe((resp) => {
			this.schoolProfile = resp;
		});
	}

	setNewVariables() {
		this.student.new_admno = this.student.admno;
		if (this.student.upi) {
			this.student.new_upi = this.student.upi;
		}
	}

	initItems() {
		this.error_st = false;
		this.error_msg = "";
		this.wasStudentDeleted = false;
		this.showUploadSection = false;
		this.progressPercentage = 0;
		this.custom_errors = [];
		this.rightSidebar = false;
		this.admit_student = false;
	}

	getStudentsProfile() {
		this.loadingStudent = true;
		this.studentsService.getStudentsProfile(this.routeId).pipe(takeUntil(this.destroy$), finalize(() => this.loadingStudent = false)).subscribe({
			next: (resp: any) => {
				this.student = resp;
				if (
					this.student?.url &&
					this.student?.url?.length > 0
				) {
					this.image_path = this.dataService.getUserImage(this.student.url);
					this.showPhoto = true;
				}
			},
			error: err => {
				this.responseHandler.error(err, "getStudentsProfile()");
			},
			complete: () => {
				this.initializeStudentProfileForm();
				this.setNewVariables();
				this.initItems();
			}
		});
	}

	private initializeStudentProfileForm() {
		this.studentProfileForm = this.fb.group({
			admNo: [
				{
					value: this.student.admno,
					disabled: this.isDisabled
				},
				Validators.required
			],
			upi: [
				{
					value: this.student.upi,
					disabled: this.isDisabled
				}
			],
			name: [
				{
					value: this.student.name,
					disabled: this.isDisabled
				},
				Validators.required
			],
			indexNo: [
				{
					value: this.student.indexnumber,
					disabled: this.isDisabled
				}
			],
			dateOfAdmission: [
				{
					value: this.student.date_of_admission,
					disabled: this.isDisabled
				}
			],
			enrollmentForm: [
				{
					value: this.student.enrollmentForm,
					disabled: this.isDisabled
				}
			],
			dateOfBirth: [
				{
					value: this.student.dob,
					disabled: this.isDisabled
				}
			],
			birthCertEntryNo: [
				{
					value: this.student.birth_cert_number,
					disabled: this.isDisabled
				}
			],
			primarySchoolName: [
				{
					value: this.student.primary_school,
					disabled: this.isDisabled
				}
			],
			kcpeIndex: [
				{
					value: this.student.kcpe_index,
					disabled: this.isDisabled
				}
			],
			kcpeScore: [
				{
					value: this.student.kcpe_score,
					disabled: this.isDisabled
				}
			],
			kcpeYear: [
				{
					value: this.student.kcpe_year,
					disabled: this.isDisabled
				}
			],
			guardianName: [this.student.guardian_name],
			primaryGuardianPhone: [
				{
					value: this.student.primary_guardian_phone,
					disabled: this.isStudent
				}
			],
			secondaryGuardianPhone: [
				{
					value: this.student.secondary_guardian_phone,
					disabled: this.isStudent
				}
			],
			guardianEmail: [this.student.guardian_email],
			guardianRelation: [
				{
					value: this.student.guardian_relation,
					disabled: this.isStudent
				}
			],
			homeAddress: [
				{
					value: this.student.home_address,
					disabled: this.isStudent
				}
			],
			gender: [
				{
					value: this.student.gender?.toLowerCase(),
					disabled: this.isStudent
				}
			],
			boardingStatus: [
				{
					value: this.boardingStatuses.find(({name}) => this.student.boardingStatus?.trim() == name.trim()),
					disabled: this.isStudent
				},
				Validators.required
			],
			house: [
				{
					value: this.student.house,
					disabled: this.isStudent
				}
			],
			nhif: [
				{
					value: this.student.nhif,
					disabled: this.isStudent
				}
			],
			generalComments: [
				{
					value: this.student.general_comments,
					disabled: this.isStudent
				},
				Validators.maxLength(400)
			]
		});

		this.watchGeneralCommentsChanges();
	}

	get isDisabled(): boolean {
		return (
			(!this.userRoles?.isSchoolAdmin && !this.student.isClassteacher) ||
			this.studentWasDeleted ||
			this.isStudent
		);
	}

	get isStudent() {
		return this.userRoles?.isStudent;
	}

	get studentWasDeleted() {
		return this.student?.leftSchool;
	}

	get showIndexNumber() {
		return (
			this.student &&
			((this.student.isKcseSchool && this.student.form >= 4) ||
				(this.student.isKcpeSchool && this.student.form >= 8))
		);
	}

	private watchGeneralCommentsChanges() {
		this.generalCommentsLength =
			400 - (this.student.general_comments?.length || 0);

		this.studentProfileForm
			.get("generalComments")
			?.valueChanges.subscribe((generalComments) => {
				this.generalCommentsLength = 400 - generalComments.length;
			});
	}
	getFormStreams() {
		this.studentsService.getFormStreams(false, true).subscribe((resp) => {
			this.form_streams = resp;
		});
	}
	getStudentResidences() {
		this.studentsService.getStudentResidences().subscribe((resp: any) => {
			this.student_residences = resp.residences;
		});
	}

	updateStudentProfile() {
		this.initItems();
		if (this.studentProfileForm.invalid) return;

		const {
			admNo,
			upi,
			name,
			indexNo,
			dateOfAdmission,
			enrollmentForm,
			dateOfBirth,
			birthCertEntryNo,
			primarySchoolName,
			kcpeIndex,
			kcpeScore,
			kcpeYear,
			guardianName,
			primaryGuardianPhone,
			secondaryGuardianPhone,
			guardianEmail,
			guardianRelation,
			homeAddress,
			gender,
			boardingStatus,
			house,
			generalComments,
			nhif
		} = this.studentProfileForm.value;

		if (
			(this.schoolProfile.boardingStatus == BoardingStatus.Boarding.trim() &&
				boardingStatus.name != BoardingStatus.Boarding) ||
			(this.schoolProfile.boardingStatus == BoardingStatus.Day &&
				boardingStatus.name != BoardingStatus.Day)
		) {

			this.translate
				.get("students.profile.toastMessages.invalidBoardingStatus")
				.subscribe((translation) => {
					this.toastService.info(translation);
				});
			return;
		}

		const studentProfile = {
			admno: this.student.admno,
			upi: this.student.upi,
			new_admno: admNo,
			birth_cert_number: birthCertEntryNo,
			date_of_admission: dateOfAdmission,
			enrollmentForm: enrollmentForm,
			dob: dateOfBirth,
			gender: gender,
			guardian_email: guardianEmail,
			guardian_name: guardianName,
			guardian_relation: guardianRelation,
			home_address: homeAddress,
			kcpe_index: kcpeIndex,
			kcpe_score: kcpeScore,
			kcpe_year: kcpeYear,
			name: name,
			new_upi: upi,
			primary_guardian_phone: primaryGuardianPhone,
			primary_school: primarySchoolName,
			secondary_guardian_phone: secondaryGuardianPhone,
			general_comments: generalComments,
			house: house,
			dayScholar: boardingStatus?.value,
			indexnumber: indexNo,
			nhif: nhif,
			url: this.student.url
		};

		const studentProfiles = [studentProfile];

		this.updatingProfile = true;

		this.studentsService
			.updateStudentProfiles(studentProfiles)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.updatingProfile = false;
					this.isUploadingImageFile = false;
					this.showPhoto = true;
				})
			)
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp, "updateStudentProfile()");
					this.getStudentsProfile();
				},
				error: (error) => {
					if (error.status == 422) {
						this.custom_errors = error.error;
						this.rightSidebar = true;
					} else {
						this.responseHandler.error(error, "updateStudentProfile");
					}
				}
			});
	}


	confirmDeleteStudent() {
		this.initItems();
		Swal.fire({
			title: this.translate.instant("students.profile.swal.title3"),
			text: this.translate.instant("students.profile.swal.text3"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextProceed"
			),
			cancelButtonText: this.translate.instant(
				"common.swal.cancelButtonTextCancel"
			)
		}).then((result) => {
			if (result.isConfirmed) {
				this.deleteStudent();
			}
		});
	}

	private deleteStudent() {
		this.studentsService.deleteStudent(this.student.userid).subscribe({
			next: () => {
				this.wasStudentDeleted = true;
				this._location.back();
				Swal.fire(
					this.translate.instant("students.profile.swal.title4"),
					"success"
				);
			},
			error: (error) => {
				this.error_st = true;
				this.responseHandler.error(error, "deleteStudent()");
			}
		});
	}

	isUploadingImageFile = false;

	uploadLogo(file: any) {
		this.initItems();
		file = file.target.files[0];
		if (file) {
			/**Limit upload size to 1mb */
			const maximumSize = 1; // Maximum file size in megabytes.
			const fileSize = file.size / 1024 / 1024;
			if (fileSize > maximumSize) {
				this.toastService.info(
					this.translate.instant("common.maximumFilesize", {
						maxsize: `${maximumSize}mb`
					})
				);
				this.logoFile.img = "";
				return;
			}

			const date = new Date().getTime();
			const imageName =
				uuid.v4() + "_" + date + "_" + Math.floor(Math.random() * 10000000);
			this.showUploadSection = true;
			const url =
				"https://www.googleapis.com/upload/storage/v1/b/z_analytics_student_images/o?uploadType=media&name=" +
				imageName +
				"&key=AIzaSyAYygnoTN0QtVj7LldwAfO3TVE8xB0bogs";

			this.isUploadingImageFile = true;

			this.dataService
				.sendFile(file, url)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (data) => {
						this.initItems();
						let storedPath =
							"https://storage.googleapis.com/z_analytics_student_images/" +
							imageName;
						storedPath = storedPath.replace("@", "%40");
						this.image_path = storedPath;
						this.student.url = storedPath;
						if (data.type == HttpEventType.UploadProgress) {
							this.progressPercentage = Math.round(
								100 * (data.loaded / (data.total || 0))
							);
						}
					},
					error: (error) => {
						this.responseHandler.error(error, "uploadLogo()");
						this.isUploadingImageFile = false;
					},
					complete: () => this.updateStudentProfile()
				});
		} else {
			this.logoFile.img = null;
		}
	}

	isDeletingPhoto = false;

	deletePhoto() {
		Swal.fire({
			title: this.translate.instant("students.profile.swal.title5"),
			text: this.translate.instant("students.profile.swal.text5"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextYes"
			),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo")
		}).then((result) => {
			if (result.isConfirmed) {
				const url = "groups/delete/photo?admno=" + this.student.admno;
				this.dataService
					.deleteObject(url)
					.pipe(
						takeUntil(this.destroy$),
						finalize(() => (this.isDeletingPhoto = false))
					)
					.subscribe({
						next: (data) => {
							this.image_path = this.dataService.getUserImage();
							this.showPhoto = false;
							this.responseHandler.success(data, "deletePhoto()");
						},
						error: (error) => this.responseHandler.error(error, "deletePhoto()")
					});
			}
		});
	}

	invalidateStreams() {
		this.new_student.STREAM = "";
		this.selectedForm.streams = this.selectForm.streams;
	}

	initAdmitStudent() {
		this.new_student = new Student();
		this.selectedForm = {};
		this.admit_student = true;
	}

	cancelAdmitStudent() {
		this.admit_student = false;
	}

	reAdmitStudent() {
		this.error_st = false;
		this.error_msg = "";
		Swal.fire({
			title: "Re-Admit Student!",
			text: "Are you sure you'd like to re-admit this student?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Proceed",
			cancelButtonText: "Cancel"
		}).then((val) => {
			if (val.isConfirmed) {
				const url =
					"groups/school/student/readmit/" +
					this.student.userid +
					"?streamid=" +
					this.new_student.stream.streamid;
				this.dataService
					.send(null, url)
					.pipe(takeUntil(this.destroy$))
					.subscribe({
						next: (resp: any) => {
							if (resp.responseCode == 200) {
								this.toastService.success("Student re-admitted successfully");
								this.getStudentsProfile();
							}
						},
						error: (err: HttpErrorResponse) => {
							this.responseHandler.error(err, "reAdminStudent()");
							this.error_st = true;
						}
					});
			}
		});
	}

	get isKenyanSchool() {
		return (
			this.schoolTypeData?.isKcseSchool ||
			this.schoolTypeData?.isKcpePrimarySchool ||
			this.schoolTypeData?.isIgcse
		);
	}

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}
}
