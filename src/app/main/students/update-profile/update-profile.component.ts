import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { ExcelTemplateHeader } from "../../../@core/models/excel/excel-template-header";
import { NewStudentInputErrors } from "../../../@core/models/student/new-student-input-errors";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { ExcelDownloadTemplateComponent } from "src/app/@core/shared/ui-components/excel-download-template/excel-download-template.component";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import { BoardingStatus } from "src/app/@core/enums/boarding-status/boarding-status";

@Component({
	selector: "app-update-profile",
	templateUrl: "./update-profile.component.html",
	styleUrls: ["./update-profile.component.scss"]
})
export class UpdateProfileComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	schoolTypeData!: SchoolTypeData;
	students: any[] = [];
	rightSidebar = false;
	customErrors: any[] = [];
	showLoading = false;
	fileSubmitted = false;
	schoolProfile?: SchoolInfo;

	@ViewChild(ExcelDownloadTemplateComponent)
	private excelComponent!: ExcelDownloadTemplateComponent;

	constructor(
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private studentsService: StudentsService,
		private schoolService: SchoolService
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.setSchoolTypeData();
		this.getSchoolProfile();
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.pipe(takeUntil(this.destroy$)).subscribe((schoolProfile: SchoolInfo) => {
			this.schoolProfile = schoolProfile;
		});
	}

	setSchoolTypeData() {
		this.dataService.schoolData
			.pipe(takeUntil(this.destroy$))
			.subscribe((schoolTypeData) => {
				this.schoolTypeData = schoolTypeData;
			});
	}

	setUploadedStudents(uploadedStudents: any[]) {
		this.closeSidebar();

		uploadedStudents.forEach((student: any) => {

			if (student.DOB) {
				const dob = moment(student.DOB, "DD/MM/YYYY");
				if (dob && dob.isValid()) {
					student.DOB = moment(dob).format("DD/MM/YYYY");
				} else {
					student.has_invalid_date = true;
				}
			} else {
				delete student.DOB;
			}

			if (student.DATE_OF_ADMISSION) {
				const dateOfAdmission = moment(student.DATE_OF_ADMISSION, "DD/MM/YYYY");
				if (dateOfAdmission && dateOfAdmission.isValid()) {
					student.DATE_OF_ADMISSION = moment(dateOfAdmission).format("DD/MM/YYYY");
				} else {
					student.has_invalid_date_of_adm = true;
				}
			} else {
				delete student.DATE_OF_ADMISSION;
			}

			(((student?.BOARDING_STATUS?.toLowerCase()?.trim() !== BoardingStatus?.Day?.toLowerCase().trim()) && (this.schoolProfile?.boardingStatus?.toLowerCase().trim() !== BoardingStatus?.Day?.toLowerCase().trim() )) || student.HOUSE)? student.dayScholar = false: student.dayScholar = true;
			delete student?.BOARDING_STATUS;
		});

		this.students = uploadedStudents;
	}

	private closeSidebar() {
		this.rightSidebar = false;
		this.customErrors = [];
	}

	doUpdateProfile() {
		this.fileSubmitted = true;

		this.checkInputRelatedErrors();

		if (this.customErrors.length > 0 || !this.students.length)
			return;

		Swal.fire({
			title: this.translate.instant("students.profile.swal.title"),
			text: this.translate.instant("students.profile.swal.text"),
			icon: "question",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((result) => {
			if (result.isConfirmed) {
				this.updateStudentsProfile();
			}
		});
	}

	checkInputRelatedErrors() {
		this.students.forEach((student: any, index) => {
			const studentName = student.NAME ? student.NAME : "";
			const inputErrors = new NewStudentInputErrors(
				student,
				index,
				this.students,
				this.translate
			).getUpdateProfileErrors(this.translate.instant("students.new.inputErrors.student", { name: `${(index + 1)} ${studentName ? "(" + studentName + ")" : ""}` }));

			if (inputErrors.msg.length > 0) {
				this.customErrors.push(inputErrors);
			}
		});

		this.openSidebar();
	}

	openSidebar() {
		if (this.customErrors.length > 0) {
			this.rightSidebar = true;
		}
	}

	private updateStudentsProfile() {
		this.showLoading = true;
		this.studentsService.updateStudentsProfile(this.students)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.fileSubmitted = false;
					this.showLoading = false;

					const messageKey = this.students.length > 1 ? "message1" : "message2";
					Swal.fire(
						this.translate.instant("students.profile.swal.title2"),
						this.translate.instant(`students.profile.swal.${messageKey}`, { number: this.students.length }),
						"success"
					);
					this.excelComponent.resetPage();
				},
				error: error => {
					this.fileSubmitted = false;
					this.showLoading = false;

					if (error.status == 422) {
						this.customErrors = error.error;
						this.openSidebar();
					} else {
						const message = this.translate.instant("common.toastMessages.anErrorOccurred2");
						this.toastService.error(message);
					}

				}
			});
	}

	get excelTemplateHeaders(): ExcelTemplateHeader[] {
		return [
			// the 'key' refers to translation keys in as in en.json
			{
				key: "admno",
				value: "ADMNO",
				translate: true
			},
			{
				key: "indexNumber",
				value: "INDEXNUMBER",
				translate: true
			},
			...this.upiHeaders,
			{
				key: "name",
				value: "NAME",
				width: 20,
				translate: true
			},
			{
				key: "gender",
				value: "GENDER",
				translate: true
			},
			{
				key: "dateOfAdmission",
				value: "DATE_OF_ADMISSION",
				translate: true
			},
			...this.boardingHeaders,
			{
				key: "dob",
				value: "DOB",
				translate: true
			},
			{
				key: "birthCertNumber",
				value: "BIRTH_CERT_NUMBER",
				translate: true
			},
			{
				key: "primarySchool",
				value: "PRIMARY_SCHOOL",
				translate: true
			},
			...this.schoolIndependentColumns,
			{
				key: "guardianName",
				value: "GUARDIAN_NAME",
				translate: true
			},
			{
				key: "primaryGuardianPhone",
				value: "PRIMARY_GUARDIAN_PHONE",
				translate: true
			},
			{
				key: "secondaryGuardianPhone",
				value: "SECONDARY_GUARDIAN_PHONE",
				translate: true
			},
			{
				key: "guardianEmail",
				value: "GUARDIAN_EMAIL",
				translate: true
			},
			{
				key: "guardianRelation",
				value: "GUARDIAN_RELATION",
				translate: true
			},
			{
				key: "homeAddress",
				value: "HOME_ADDRESS",
				translate: true
			},
			{
				key: "generalComments",
				value: "GENERALCOMMENTS",
				translate: true
			},
		];
	}

	get isGhanaSchool() {
		return (
			this.schoolTypeData?.isGhanaJuniorSchool ||
			this.schoolTypeData?.isGhanaPrimaryJuniorSchool ||
			this.schoolTypeData?.isGhanaPrimarySchool ||
			this.schoolTypeData?.isGhanaSeniorSchool
		);
	}

	get isZambiaSchool() {
		return this.schoolTypeData?.isZambiaPrimarySchool || this.schoolTypeData?.isZambiaSecondarySchool;
	}

	get upiHeaders(): Array<{ key: string, value: string, translate: boolean }> {
		if (this.isZambiaSchool || this.isGhanaSchool) return [];

		return [
			{
				key: "upi",
				value: "NEW_UPI",
				translate: true
			},
		];
	}

	get boardingHeaders(): Array<{ key: string, value: string, translate:boolean }> {
		if (this.schoolProfile?.boardingStatus == BoardingStatus.Day) return [];
		if (this.schoolProfile?.boardingStatus == BoardingStatus.Boarding)
			return [
				{
					key: "house",
					value: "HOUSE",
					translate: true
				}
			];

		return [
			{
				key: "boardingStatus",
				value: "BOARDING_STATUS",
				translate: true
			},
			{
				key: "house",
				value: "HOUSE",
				translate: true
			}
		];
	}

	get isMajorsSchool() {
		return this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool || this.schoolTypeData?.isGhanaSeniorSchool;
	}

	get schoolIndependentColumns(): Array<{ key: string, value: string }> {
		if (this.schoolTypeData?.isKcseSchool) {
			return this.ksceSchoolColumns;
		} else if (this.isMajorsSchool) {
			return this.majorsSchoolColumns;
		} else {
			return [];
		}
	}

	get ksceSchoolColumns() {
		return [
			{
				key: "nhif",
				value: "NHIF",
			},
			{
				key: "kcpeIndex",
				value: "KCPE_INDEX",
				translate: true
			},
			{
				key: "kcpeScore",
				value: "KCPE_SCORE",
				translate: true
			},
			{
				key: "kcpeYear",
				value: "KCPE_YEAR",
				translate: true
			},
		];
	}

	get majorsSchoolColumns() {
		return [
			{
				key: "major",
				value: "MAJOR",
				translate: true
			}
		];
	}
}
