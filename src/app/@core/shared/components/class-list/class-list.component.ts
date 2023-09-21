import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, Observable, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { Subjects } from "src/app/@core/models/classes/subject";
import { ClassListPdfDoc } from "src/app/@core/models/printouts/class-list/class-list-pdf-doc";
import { Role } from "src/app/@core/models/Role";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { PrintoutsService } from "src/app/@core/services/printouts/printouts.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { FormOrYearPipe } from "../../pipes";
import { DataService } from "../../services/data/data.service";
import { ResponseHandlerService } from "../../services/response-handler/response-handler.service";
import { RolesService } from "../../services/role/roles.service";
import { BasicUtils } from "../../utilities/basic.utils";

@Component({
	selector: "app-class-list",
	templateUrl: "./class-list.component.html",
	styleUrls: ["./class-list.component.scss"],
	providers: [FormOrYearPipe]
})
export class ClassListComponent implements OnInit, OnDestroy, OnChanges {
	destroy$ = new Subject<boolean>();
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	@Input() intakeId = 0;
	@Input() streamId = 0;
	@Input() subjectId = 0;
	@Input() seriesId = 0;
	@Input() egroupId = 0;
	@Input() classId = 0;

	@Output() isFetchingClassList = new EventEmitter<boolean>();

	schoolTypeData?: SchoolTypeData;

	selected: any = {};

	data: any;
	classDetails: any;
	admin: any;
	currentYear?: number;
	profileOptions: any;
	school?: SchoolInfo;
	documentHeaders: Array<{ key: string; value: string; widthClass?: string }> = [];

	showKcpe = false;
	showStream = false;
	showPhone = false;
	showGender = false;
	title = "";
	documentTitle = "";
	pdfTitle = "";

	subjects: Subjects[] = [];
	isLoadingSubjects = false;

	isMobileApp = false;
	noStudents = false;

	showCustoms = false;
	basicRadioOption = true;
	customRadioOption = false;

	isFetching = false;
	isLoadingClasslistRequirements = false;

	constructor(
		private dataService: DataService,
		private studentsService: StudentsService,
		private printoutsService: PrintoutsService,
		private classesService: ClassesService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private formOrYearPipe: FormOrYearPipe,
		private rolesService: RolesService
	) { }

	ngOnInit(): void {
		this.isMobileApp = this.dataService.getIsMobileApp();
		this.initializeTableHeaders();
	}

	ngOnChanges(changes: SimpleChanges) {
		const intakeId = changes["intakeId"]?.currentValue;
		const streamId = changes["streamId"]?.currentValue;
		const classId = changes["classId"]?.currentValue;
		const subjectId = changes["subjectId"]?.currentValue;

		if ((intakeId || intakeId >= 0) || (streamId || streamId >= 0) || (classId || classId >= 0) || (subjectId || subjectId >= 0)) {
			// controlling loading state
			if ((this.intakeId === 0) && (this.streamId === 0) && (this.classId === 0) && (this.subjectId === 0)) {
				this.isFetchingClassList.emit(false);
			} else {
				this.isFetchingClassList.emit(true);

				this.initializeTableHeaders();

				// retrieving all the neccesary data before calling API to retrieve class list
				this.loadClassListRequirements();
			}
		}
	}

	private initializeTableHeaders() {
		this.documentHeaders = [
			{
				key: "#",
				value: "#"
			},
			{
				key: "url",
				value: this.translate.instant("common.image").toUpperCase(),
				widthClass: "w-p10"
			},
			{
				key: "admno",
				value: this.translate.instant("workSheet.headers.admno").toUpperCase(),
				widthClass: "w-p10"
			},
			{
				key: "name",
				value: this.translate.instant("workSheet.headers.name").toUpperCase(),
				widthClass: "w-p35"
			}
		];
	}

	private loadClassListRequirements() {
		this.isLoadingClasslistRequirements = true;

		combineLatest([
			this.dataService.schoolData,
			this.dataService.getSchoolProfile(),
			this.dataService.getCurrentYear(),
			this.printoutsService.getSubject(this.subjectId),
			this.classesService.getClassAdmin(this.classId, this.streamId, this.subjectId, this.intakeId),
		]).pipe(takeUntil(this.destroy$)).subscribe({
			next: ([schoolTypeData, schoolInfo, currentYear, subject, admin]) => {
				this.schoolTypeData = schoolTypeData;

				this.school = schoolInfo;
				this.showGender = this.school.genderType === 3;

				this.currentYear = currentYear;
				this.selected.subject = subject;
				this.admin = admin;

				this.initData();
			},
			error: (err) => this.responseHandler.error(err, "ClassListComponent"),
		});
	}

	private initData() {
		this.getProfileOptions();
		this.getClassDetails();
	}

	private getProfileOptions() {
		let intakeId = 0;

		if (this.intakeId > 0) intakeId = this.intakeId;

		this.classesService.loadClassListOptions(intakeId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.profileOptions = resp;
				this.profileOptions?.options?.forEach((option: any) => {
					option.selected = true;
				});
			},
			error: (err) => this.responseHandler.error(err, "getProfileOptions()"),
		});
	}

	private getClassDetails() {
		this.showStream = false;
		this.showPhone = false;
		this.classDetails = {};

		let classDetails$!: Observable<any>;

		if (this.classId > 0) {
			classDetails$ = this.classesService.getBasicDetailsSubjectClass(this.classId);
		} else if (this.streamId > 0) {
			classDetails$ = this.classesService.getBasicDetailsStream(this.streamId);
		} else if (this.intakeId > 0) {
			classDetails$ = this.classesService.getBasicDetailsIntake(this.intakeId);
		}

		classDetails$?.pipe(finalize(() => this.isFetchingClassList.emit(false)), takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.classDetails = resp;
				const formOrYear = this.schoolTypeData?.formoryear;

				if ((this.classDetails?.form > 4 && this.classDetails?.is_graduated) || this.classDetails?.graduation_year < this.currentYear!) {
					this.title = "Class of " + this.classDetails.graduation_year;
				} else {
					this.title = `${this.formOrYearPipe.transform(formOrYear)} ${this.classDetails.form}`;
				}

				if (this.streamId > 0 || this.classId > 0) {
					this.documentTitle = this.title + " " + this.classDetails.stream;
				} else if (this.intakeId > 0) {
					this.documentTitle = this.title;
					this.showStream = true;

					if (!(this.subjectId > 0)) this.showPhone = true;
				}

				if (this.selected?.subject?.name) {
					this.documentTitle += " - " + this.selected.subject.name;
					this.showKcpe = false;
				}

				if (this.classDetails?.form > 4 || this.classDetails?.is_graduated || this.classDetails?.graduation_year < this.currentYear!) {
					this.pdfTitle = this.documentTitle;
				} else {
					this.pdfTitle = this.documentTitle + " - " + this.currentYear;
				}

				this.documentTitle = this.pdfTitle + " - " + this.translate.instant("common.classlist");

				if (this.showStream) {
					const streamText = this.translate.instant("common.stream").toUpperCase();

					const foundStreamText = this.documentHeaders.findIndex((item) => item.value === streamText);
					if (foundStreamText == -1) {
						// find name column index
						const nameText = this.translate.instant("workSheet.headers.name").toUpperCase();
						const foundNameTextIndex = this.documentHeaders.findIndex((item) => item.value === nameText);

						// adding the 'stream' column after the 'name' column
						this.documentHeaders.splice(foundNameTextIndex + 1, 0, { key: "stream", value: streamText, widthClass: "w-p10" });
					}
				}

				if (this.schoolTypeData?.isKcseSchool) {
					const kcpeText = this.translate.instant("common.kcpe").toUpperCase();

					const foundKcpeText = this.documentHeaders.findIndex((item) => item.value === kcpeText);
					if (foundKcpeText == -1) this.documentHeaders.push({ key: "kcpe", value: kcpeText, widthClass: "w-p10" });
				}

				if (this.showGender) {
					const genderText = this.translate.instant("common.gender").toUpperCase();

					const foundGenderText = this.documentHeaders.findIndex((item) => item.value === genderText);
					if (foundGenderText == -1) this.documentHeaders.push({ key: "gender", value: genderText, widthClass: "w-p10" });
				}

				if (this.showPhone) {
					const contactText = this.translate.instant("common.contacts").toUpperCase();

					const foundContactText = this.documentHeaders.findIndex((item) => item.value === contactText);
					if (foundContactText == -1) {
						// find gender column index
						const genderText = this.translate.instant("common.gender").toUpperCase();

						const foundGenderTextIndex = this.documentHeaders.findIndex((item) => item.value === genderText);

						// adding the 'contacts' column before the 'gender' column
						this.documentHeaders.splice(foundGenderTextIndex, 0, { key: "phone", value: contactText, widthClass: "w-p15" });
					}
				}

				this.selected.intake = this.schoolTypeData?.current_forms_list.find(({ intakeid }) => intakeid == this.classDetails.intakeid);
				this.selected.stream = this.selected.intake?.streams.find(({ streamid }) => streamid == this.classDetails.streamid);

				this.getData();
			},
		});
	}

	get isLoadingClassList() {
		return this.isLoadingClasslistRequirements || this.isFetching;
	}

	private getData() {
		let studentList$: Observable<any> = new Observable();

		this.data = [];

		if (this.subjectId > 0 && (this.streamId > 0 || this.intakeId > 0)) {
			studentList$ = this.printoutsService.getStudentsList_SubjectClass(-1, this.intakeId, this.streamId, this.subjectId);
		} else if (this.classId > 0) {
			studentList$ = this.printoutsService.getStudentsList_SubjectClass(this.classId);
		} else if (this.streamId > 0) {
			studentList$ = this.studentsService.getStudentsList_Stream(this.streamId);
		} else if (this.intakeId > 0) {
			studentList$ = this.classesService.getStudentsListIntake(this.intakeId);
		}

		this.isLoadingClasslistRequirements = false;
		this.isFetching = true;

		studentList$.pipe(finalize(() => this.isFetching = false), takeUntil(this.destroy$)).subscribe({
			next: (resp) => {
				this.data = resp;

				if (this.data) {
					this.noStudents = false;

					if (this.data.length > 0) {
						if (this.data[0]?.upi) {
							const upiText = this.upiTranslation.toUpperCase();

							const foundUPIText = this.documentHeaders.findIndex(item => item.value === upiText);
							if (foundUPIText == -1) {
								this.documentHeaders.splice(2, 0, { key: "upi", value: upiText, widthClass: "w-p10" });
							}
						}
					}
				} else {
					this.noStudents = true;
				}
			},
			error: (err) => this.responseHandler.error(err, "getData()"),
		});
	}

	isLoading = false;

	private getClassListDocument(): Promise<any> {
		return new ClassListPdfDoc(
			this.translate.instant("printouts.classList.title"),
			this.school!,
			this.documentHeaders,
			this.data,
			this.documentTitle,
			this.classTeacher,
			false,
			false
		).build();
	}

	get classTeacher(): string {
		if (this.admin?.name) return this.translate.instant("classes.manageSubject.table.teacherParam", { teacher: this.admin?.name });

		return "";
	}

	private get countryHeaders() {
		if (!this.schoolTypeData?.isKcseSchool) return [];

		return [
			{
				key: "upi",
				value: this.upiTranslation
			},
			{
				key: "kcpe",
				value: this.translate.instant("common.kcpe")
			}
		];
	}

	private get excelHeaders() {
		return [
			{
				key: "admno",
				value: this.translate.instant("common.admno")
			},
			{
				key: "name",
				value: this.translate.instant("common.name")
			},
			{
				key: "stream",
				value: this.translate.instant("common.stream")
			},
			...this.countryHeaders,
			{
				key: "phone",
				value: this.translate.instant("common.contacts")
			},
			{
				key: "gender",
				value: this.translate.instant("common.gender")
			}
		];
	}

	downloadSpreadsheet() {
		const sheetData: any[] = this.data;
		const studentList: any = [];
		const spreadsheetHeaders = this.excelHeaders.map(({ value }) => value);

		studentList.push(spreadsheetHeaders);

		sheetData.forEach((student: any) => {
			const studentData: any = [];

			this.excelHeaders.forEach((header) => {
				studentData.push(student[`${header.key}`]);
			});

			studentList.push(studentData);
		});

		this.dataService.downloadExcelSheet(studentList, this.documentTitle, "", false);
	}

	async downloadClassListAsPdf(action: "download" | "print" = "download") {
		try {
			const doc = await this.getClassListDocument();
			action == "download" ? doc.create().download(this.documentTitle) : doc.create().print();
		} catch (err) {
			this.responseHandler.error(err, "downloadClassListAsPdf()");
		}
	}

	downloadCustomList() {
		if (this.profileOptions && this.profileOptions?.options && this.profileOptions?.options?.length) {
			if (this.intakeId > 0 || this.streamId > 0 || this.subjectId > 0) {
				const selected_options: any[] = [];
				this.profileOptions.options.forEach((option: any) => {
					if (option.selected) selected_options.push(option.value);
				});

				let fileName = "";
				if (this.selected?.intake?.classlevel > 0 && !this.selected?.stream?.name && !this.selected?.subject?.name) {
					fileName = this.formOrYearPipe.transform(this.schoolTypeData?.formoryear) + " " + this.selected.intake.classlevel + " Students - " + this.currentYear + ".xlsx";
				} else if (this.selected?.intake?.classlevel > 0 && this.selected?.stream?.name && !this.selected?.subject?.name) {
					fileName = this.formOrYearPipe.transform(this.schoolTypeData?.formoryear) + " " + this.selected.intake.classlevel + " " + this.selected.stream.name + " Students - " + this.currentYear + ".xlsx";
				} else if (this.selected?.intake?.classlevel > 0 && !this.selected?.stream?.name && this.selected?.subject?.name) {
					fileName = this.formOrYearPipe.transform(this.schoolTypeData?.formoryear) + " " + this.selected.intake.classlevel + " " + this.selected.subject.name + " Students - " + this.currentYear + ".xlsx";
				} else if (this.selected?.intake?.classlevel > 0 && this.selected?.stream?.name && this.selected?.subject?.name) {
					fileName = this.formOrYearPipe.transform(this.schoolTypeData?.formoryear) + " " + this.selected.intake.classlevel + " " + this.selected.stream.name + " " + this.selected.subject.name + " Students - " + this.currentYear + ".xlsx";
				}

				const studentsText = this.translate.instant("common.students");
				if (this.selected?.intake?.graduationYear && !this.selected?.stream?.name && !this.selected.subject.name) {
					fileName = `${this.selected.intake.graduationYear} ${studentsText}.xlsx`;
				} else if (this.selected?.intake?.graduationYear && this.selected?.stream?.name && !this.selected?.subject?.name) {
					fileName = `${this.selected.intake.graduationYear} ${this.selected.stream.name} ${studentsText}.xlsx`;
				} else if (this.selected?.intake?.graduationYear && !this.selected?.stream?.name && this.selected?.subject?.name) {
					fileName = `${this.selected.intake.graduationYear} ${this.selected.subject.name} ${studentsText}.xlsx`;
				} else if (this.selected?.intake?.graduationYear && this.selected?.stream?.name && this.selected?.subject?.name) {
					fileName = `${this.selected.intake.graduationYear} ${this.selected.stream.name} ${this.selected.subject.name} ${studentsText}.xlsx`;
				}

				let params = "";
				if (this.streamId && this.streamId > 0) {
					params += "?streamid=" + this.streamId;
					if (this.subjectId && this.subjectId > 0) params += "&subjectid=" + this.subjectId;
				} else if (this.intakeId && this.intakeId > 0) {
					params = "?intakeid=" + this.intakeId;
					if (this.subjectId && this.subjectId > 0) params += "&subjectid=" + this.subjectId;
				}

				const url = "groups/classlist/studentprofiles" + params + "&options=" + JSON.stringify(selected_options);

				this.printoutsService.getCustomClassList(url).subscribe({
					next: (resp) => {
						const blob = new Blob([resp], { type: "application/vnd.ms-excel" });
						this.printoutsService.custom_saver(blob, fileName);
					},
					error: (error) => this.responseHandler.error(error, "downloadCustomList()"),
				});
			}
		}
	}

	toggleList(option: string) {
		switch (option) {
		case "basic":
			this.basicRadioOption = true;
			this.customRadioOption = false;
			this.showCustoms = false;
			break;
		case "custom":
			this.basicRadioOption = false;
			this.customRadioOption = true;
			this.showCustoms = true;
			break;
		default:
			this.basicRadioOption = false;
			this.customRadioOption = false;
			this.showCustoms = false;
			break;
		}
	}

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
