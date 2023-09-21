import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { Subject } from "rxjs";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { NewStudentInputErrors } from "../../../@core/models/student/new-student-input-errors";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { takeUntil } from "rxjs/operators";
import { MajorService } from "../../../@core/services/classes/majors/major.service";
import { Major } from "../../../@core/models/major/major";
import { FormOrYearPipe } from "../../../@core/shared/pipes/form-or-year.pipe";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { ExcelTemplateHeader } from "../../../@core/models/excel/excel-template-header";
import { BoardingStatus } from "src/app/@core/enums/boarding-status/boarding-status";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

class Student {
	ADMNO!: string;
	NAME!: string;
	FORM!: number;
	STREAM!: string;
	GENDER?: string;
	dayScholar?: boolean;
	HOUSE?:	string;
	DATE_OF_BIRTH: any;
	has_invalid_date = false;
	ADMISSION_DATE: any;
	MAJOR!: string;
	has_invalid_date_of_adm = false;
}

@Component({
	selector: "app-new-student",
	templateUrl: "./new-student.component.html",
	styleUrls: ["./new-student.component.scss"]
})
export class NewStudentComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	@Input() schoolSetup = false;
	schoolTypeData!: SchoolTypeData;
	keyInStudentInfo = true;
	selected_intake: any;
	newStudents: any[] = [];
	majors: Major[] = [];

	rightSidebar = false;
	customErrors: any[] = [];
	showLoading = false;
	schoolProfile?: SchoolInfo;

	newStudentForm = this.fb.group({
		admNo: ["", Validators.required],
		name: ["", Validators.required],
		intake: ["", Validators.required],
		stream: ["", Validators.required],
		gender: ["", Validators.required],
		boardingStatus: [null, Validators.required]
	});

	uploadForm = this.fb.group({
		intake: ["", Validators.required],
		studentListFile: [null, Validators.required],
	});

	submitted = false;
	uploadSubmitted = false;

	isAdding = false;

	boardingStatuses = [
		{
			label: this.translate.instant("settings.schoolInfoProfile.boardingStatus.day"),
			key: "Day",
			value: true
		},
		{
			label: this.translate.instant("settings.schoolInfoProfile.boardingStatus.boarding"),
			key: "Boarding",
			value: false
		},
	];

	constructor(
		private summaryService: SummaryService,
		private dataService: DataService,
		private studentsService: StudentsService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private fb: FormBuilder,
		private schoolService: SchoolService,
		private majorService: MajorService,
		private formOrYearPipe: FormOrYearPipe
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.getSchoolProfile();
		this.updateIntakeStreams();
	}

	get displayBoardinStatusField(): boolean {
		return (this.schoolProfile?.boardingStatus === BoardingStatus.Mixed || !this.schoolProfile?.boardingStatus);
	}

	getSchoolTypeData() {
		this.dataService.schoolData
			.pipe(takeUntil(this.destroy$))
			.subscribe(val => {
				this.schoolTypeData = val;
				if (this.isMajorsSchool) {
					this.addMajorControl();
					this.getMajors();
				}
			});
	}

	private addMajorControl() {
		this.newStudentForm.addControl("major", this.fb.control(null, [Validators.required]));
	}

	private getMajors() {
		this.majorService.getMajors()
			.pipe(takeUntil(this.destroy$))
			.subscribe(({ majors }) => {
				this.majors = majors;
			});
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe((schoolProfile: any) => {
			this.schoolProfile = schoolProfile;
			this.setDefaultGenderType();
			this.setDefaultBoardingStatus();
		});
	}

	setDefaultBoardingStatus() {
		let schoolBoardingStatus;
		if (this.schoolProfile?.boardingStatus == BoardingStatus.Boarding) {
			schoolBoardingStatus = this.boardingStatuses.find(({key}) => key == BoardingStatus.Boarding) || "";
		} else if (this.schoolProfile?.boardingStatus == BoardingStatus.Day) {
			schoolBoardingStatus = this.boardingStatuses.find(({key}) => key == BoardingStatus.Day) || "";
		}
		this.newStudentForm.patchValue({
			boardingStatus: schoolBoardingStatus
		});
	}

	setDefaultGenderType() {
		let gender = "";
		if (this.schoolProfile?.genderType == 1) {
			gender = "male";
		} else if (this.schoolProfile?.genderType == 2) {
			gender = "female";
		}
		this.newStudentForm.patchValue({
			gender: gender
		});
	}

	updateIntakeStreams() {
		this.newStudentForm.controls["intake"].valueChanges.subscribe((selectedIntake) => {
			this.selected_intake = selectedIntake;
			this.resetSelectedStream();
		});
		this.uploadForm.controls["intake"].valueChanges.subscribe((selectedIntake) => {
			this.selected_intake = selectedIntake;
		});
	}

	resetSelectedStream() {
		this.newStudentForm.controls["stream"].setValue("");
	}

	toggleRadio(radio: string) {
		switch (radio) {
		case "keyIn":
			this.keyInStudentInfo = true;
			break;
		case "upload":
			this.keyInStudentInfo = false;
			break;
		default:
			this.keyInStudentInfo = true;
			break;
		}
	}

	addStudent() {
		this.submitted = true;
		if (this.newStudentForm.invalid)
			return;

		const { admNo, name, intake, stream, gender, boardingStatus } = this.newStudentForm.value;

		const student = new Student();
		student.ADMNO = admNo;
		student.NAME = name;
		student.FORM = intake.classlevel;
		student.STREAM = stream;
		student.GENDER = gender;
		student.dayScholar = boardingStatus?.value;

		if (this.isMajorsSchool)
			student.MAJOR = this.newStudentForm.value["major"];

		this.newStudents = [];
		this.newStudents.push(student);
		this.doAdd();
	}

	get isMajorsSchool() {
		return this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool || this.schoolTypeData?.isGhanaSeniorSchool;
	}

	uploadStudentsFromExcel() {
		this.uploadSubmitted = true;
		if (this.uploadForm.invalid)
			return;

		this.checkInputRelatedErrors();

		if (this.customErrors.length > 0) {
			this.rightSidebar = true;
			return;
		}

		this.doAdd();
	}

	doAdd() {
		Swal.fire({
			title: this.translate.instant("students.new.swal.title"),
			text: this.translate.instant("students.new.swal.text"),
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
		}).then((result) => {
			if (result.isConfirmed) {
				this.showLoading = true;
				this.isAdding = true;
				this.addNewStudents();
			}
		});
	}

	checkInputRelatedErrors() {
		this.rightSidebar = false;
		this.customErrors = [];

		this.newStudents.forEach((student, index) => {

			const studentName = student.NAME ? student.NAME : "";
			const studentDoB = student.DATE_OF_BIRTH ? moment(student.DATE_OF_BIRTH, "DD/MM/YYYY") : null;
			const studentAdmDate = student.ADMISSION_DATE ? moment(student.ADMISSION_DATE, "DD/MM/YYYY") : null;

			const inputErrors = new NewStudentInputErrors(
				student,
				index,
				this.newStudents,
				this.translate,
				this.selected_intake
			).getInputErrors(this.translate.instant("students.new.inputErrors.student", { name: `${(index + 1)} ${studentName ? "(" + studentName + ")" : ""}` }));

			if (studentDoB) {
				if (studentDoB.isValid()) {
					student.DATE_OF_BIRTH = moment(studentDoB).format("DD/MM/YYYY");
				} else {
					student.has_invalid_date = true;
				}
			} else {
				delete student.DATE_OF_BIRTH;
			}

			if (studentAdmDate) {
				if (studentAdmDate.isValid()) {
					student.ADMISSION_DATE = moment(studentAdmDate).format("DD/MM/YYYY");
				} else {
					student.has_invalid_date_of_adm = true;
				}
			} else {
				delete student.ADMISSION_DATE;
			}


			if (inputErrors.msg.length > 0) {
				this.customErrors.push(inputErrors);
			}
		});
	}

	studentAddSuccess = false;
	addNewStudents() {
		this.studentsService.addNewStudents(this.selected_intake.intakeid, this.newStudents)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.showLoading = false;
					this.isAdding = false;
					this.studentAddSuccess = true;
					this.resetFormsToInitialState();

				},
				error: error => {
					this.isAdding = false;
					this.showLoading = false;
					if (error.status == 422) {
						this.customErrors = error.error;
						this.rightSidebar = true;
					}
					const errorMsg = this.translate.instant("students.new.toastMessages.addError");
					this.toastService.error(errorMsg);
				},
				complete: () => {
					this.summaryService.setSchoolSummary();
				}
			});
	}

	resetFormsToInitialState() {
		this.submitted = false;
		this.uploadSubmitted = false;
		this.newStudentForm.reset();
		this.setDefaultGenderType();
		this.setDefaultBoardingStatus();
		this.uploadForm.reset();
	}

	addMoreStudents() {
		this.studentAddSuccess = false;
	}

	get newStudentFormControls(): { [key: string]: AbstractControl } {
		return this.newStudentForm.controls;
	}

	get uploadStudentFormControls(): { [key: string]: AbstractControl } {
		return this.uploadForm.controls;
	}

	setNewStudents(newStudents: any[]) {
		this.uploadStudentFormControls["studentListFile"].setValue("File uploaded");

		this.newStudents = newStudents?.map(student => {
			(((student?.BOARDING_STATUS?.toLowerCase()?.trim() !== BoardingStatus?.Day?.toLowerCase().trim()) && (this.schoolProfile?.boardingStatus?.toLowerCase().trim() !== BoardingStatus?.Day?.toLowerCase().trim() )) || student.HOUSE)? student.dayScholar = false: student.dayScholar = true;
			delete student?.BOARDING_STATUS;
			return student;
		});
	}

	get templateHeaders(): Array<ExcelTemplateHeader> {
		return [
			{
				key: "admno",
				value: "ADMNO",
				translate: true
			},
			{
				key: "name",
				value: "NAME",
				translate: true
			},
			{
				key: "gender",
				value: "GENDER",
				translate: true
			},
			{
				key: (this.formOrYearPipe.transform(this.schoolTypeData?.formoryear)).toLowerCase(),
				value: "FORM",
				translate: false
			},
			{
				key: "stream",
				value: "STREAM",
				translate: true
			},
			...this.upiHeaders,
			{
				key: "admissionDate",
				value: "ADMISSION_DATE",
				translate: true
			},
			...this.boardingHeaders,
			{
				key: "dob",
				value: "DATE_OF_BIRTH",
				translate: true
			},
			{
				key: "birthCertNumber",
				value: "BIRTH_CERT_NO",
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

	get upiHeaders(): Array<{ key: string, value: string, translate:boolean }> {
		if (this.isZambiaSchool || this.isGhanaSchool) return [];

		return [
			{
				key: this.upiTranslation,
				value: "UPI",
				translate: false
			},
		];
	}

	get boardingHeaders(): Array<{ key: string, value: string, translate:boolean }> {
		if (this.schoolProfile?.boardingStatus == BoardingStatus.Day) return [];
		if (this.schoolProfile?.boardingStatus == BoardingStatus.Boarding) {
			return [
				{
					key: "house",
					value: "HOUSE",
					translate: true
				}
			];
		}

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

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}
}
