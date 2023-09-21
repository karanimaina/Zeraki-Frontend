import {
	Component,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as Highcharts from "highcharts";
import exporting from "highcharts/modules/exporting";

import { DataService } from "src/app/@core/shared/services/data/data.service";
import * as XLSX from "xlsx";
import { HotToastService } from "@ngneat/hot-toast";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DateTimeAdapter, OwlDateTimeIntl } from "@danielmoncada/angular-datetime-picker";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { ReportFormService } from "../../../@core/services/printouts/report-forms/report-form.service";
import { ReportForms } from "../../../@core/models/printouts/report-forms/report-forms";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { SchoolIntake, SchoolTypeData } from "../../../@core/models/school-type-data";
import { SchoolInfo } from "../../../@core/models/school-info";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { imageFromDomToBase64 } from "../../../@core/shared/utilities/image-to-base64";
import {
	ReportFormContentImplementation
} from "../../../@core/models/printouts/report-forms/download-helper/report-form.content-implementation";
import { OptionalReportSections } from "../../../@core/models/printouts/report-forms/optional-report-sections";
import { StudentsPdfReport } from "../../../@core/models/printouts/report-forms/download-helper/students-pdf-report";
import { DatePipe } from "@angular/common";
import { StudentReport } from "../../../@core/models/printouts/report-forms/student-report";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
	selector: "app-report-forms",
	templateUrl: "./report-forms.component.html",
	styleUrls: ["./report-forms.component.scss"]
})
export class ReportFormsComponent implements OnInit, OnDestroy {
	@ViewChild("reportsContainer", { read: ViewContainerRef }) reportsContainer!: ViewContainerRef;
	@ViewChild("studentReport", { read: TemplateRef }) studentReport!: TemplateRef<any>;
	routeParams: {
		userId: number,
		intakeId: number,
		streamId: number,
		subjectId: number,
		seriesId: number,
		eGroupId: number
	} = { userId: 0, intakeId: 0, streamId: 0, subjectId: 0, seriesId: 0, eGroupId: 0 };

	schoolInfo!: SchoolInfo;
	schoolTypeData!: SchoolTypeData;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	languageChangeSub!: Subscription;
	reportForms!: ReportForms;

	reportsFormGroup!: FormGroup;

	selectedIntake!: SchoolIntake;
	examsList: any[] = [];


	noStudentsFound = false;
	fetchingExamsDataInProgress = false;
	fetchingExamsListInProgress = false;
	noExamsMessage = "";
	finally: any = {};

	feeData: any = {};
	feeDataTemp: any;
	showClassTeacherComments = true;
	showClassTeacherSignature = true;
	showCredentials = true;
	showGPA = true;
	showGradeDescriptors = true;
	showStudentOverallRank = true;
	showStudentStreamRank = true;
	showPrincipalComments = true;
	showPrincipalSignature = true;
	showParentSignature = false;
	showCustomComments = false;

	closingDate: any;
	openingDate: any;

	paramsPresent = false;

	id!: NodeJS.Timeout;
	isCompleteRenderReportForm = false;
	downloadingReportFormInProgress = false;
	private loadedStudentProfiles$: BehaviorSubject<Array<number>> = new BehaviorSubject<Array<number>>([]);
	private destroy$ = new Subject<boolean>();

	constructor(
		private dataService: DataService,
		private rolesService: RolesService,
		private studentsService: StudentsService,
		private activatedRoute: ActivatedRoute,
		private toastService: HotToastService,
		private translate: TranslateService,
		private siteLanguageService: SiteLanguageService,
		private owlDateTimeIntl: OwlDateTimeIntl,
		private owlDateTimeAdapter: DateTimeAdapter<any>,
		private reportFormsService: ReportFormService,
		private schoolService: SchoolService,
		private formBuilder: FormBuilder,
		private datePipe: DatePipe,
		private viewContainerRef: ViewContainerRef
	) {
		exporting(Highcharts);
	}

	ngOnInit(): void {
		this.checkActiveRouteParams();
		this.initiateReportsFormGroup();
		this.getSchoolProfile();
		this.getSchoolTypeData();

		this.changeOwlDatetimeLocale(null);

		this.languageChangeSub = this.translate.onLangChange.subscribe((languageChangeEvent) => {
			this.changeOwlDatetimeLocale(languageChangeEvent);
		});

	}

	ngOnDestroy(): void {
		this.languageChangeSub?.unsubscribe();
		this.destroy$.next(true);
		this.destroy$.complete();
	}

	checkActiveRouteParams() {
		const { userid, intakeid, streamid, subjectid, seriesid, egroupid } = this.activatedRoute.snapshot.params;

		this.routeParams.userId = userid;
		this.routeParams.intakeId = intakeid;
		this.routeParams.streamId = streamid;
		this.routeParams.subjectId = subjectid;
		this.routeParams.seriesId = seriesid;
		this.routeParams.eGroupId = egroupid;

		if (userid || intakeid || streamid || subjectid || seriesid || egroupid) {
			this.paramsPresent = true;
			this.recentPerformance();
		}
	}

	initiateReportsFormGroup() {
		this.reportsFormGroup = this.formBuilder.group({
			intake: [this.routeParams.intakeId, Validators.required],
			stream: [this.routeParams.streamId, Validators.required],
			exam: ["", Validators.required],
		});

		this.watchIntakeChanges();
		this.watchStreamChanges();
	}

	watchIntakeChanges() {
		this.reportsFormGroup.get("intake")?.valueChanges.subscribe((intakeId) => {
			this.selectedIntake = this.schoolTypeData.current_forms_list.find((intake) => intake.intakeid === intakeId)!;
			this.reportsFormGroup.get("stream")?.setValue("");

			this.getExamsList();
		});
	}

	watchStreamChanges() {
		this.reportsFormGroup.get("stream")?.valueChanges.subscribe((streamId) => {
			if (streamId) {
				this.getExamsList();
			}
		});
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolTypeData = schoolData;
			this.setShowCredential();
		});
	}

	private setShowCredential() {
		this.showCredentials = this.isKenyanSchool;
	}

	get isKenyanSchool() {
		return this.schoolTypeData?.isKcpePrimarySchool || this.schoolTypeData?.isKcseSchool || this.schoolTypeData?.isIgcse;
	}

	changeOwlDatetimeLocale(languageChangeEvent: any | null): void {
		const currentSiteLangauge = this.siteLanguageService.getCurrentLanguage();

		// english
		if (currentSiteLangauge?.code === "en") {
			/* owl date-time picker */
			this.owlDateTimeAdapter.setLocale("en-gb");
			this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
			this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");

			return;
		}

		/* on language change */
		if (languageChangeEvent) {
			/* owl date-time picker */
			this.owlDateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
			this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
			this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
		}

		/* owl date-time picker */
		this.owlDateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
		this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
		this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
	}

	scrollListLimit = 10;

	trackByFn(index, item) {
		return item.admNo; // unique id corresponding to the item
	}

	getExamsList() {
		const { stream, intake } = this.reportsFormGroup.value;

		let queryParams = "";
		if (stream) {
			queryParams = `?streamid=${stream}&mobile=false`;
		} else if (intake) {
			queryParams = `?intakeid=${intake}&mobile=false`;
		}

		this.examsList = [];
		this.noExamsMessage = "";
		this.fetchingExamsListInProgress = true;

		this.studentsService.getStreamIntakeExamData(queryParams, true).subscribe(
			(examData: any) => {
				this.fetchingExamsListInProgress = false;
				this.examsList = examData?.exams?.reverse() || [];

				if (!this.examsList.length) {
					this.noExamsMessage = "No Exams Found";
				}
			},
			() => {
				this.fetchingExamsListInProgress = false;
				this.toastService.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
			}
		);
	}

	getReportForms() {
		this.reportsFormGroup.markAllAsTouched();

		if (this.reportsFormGroup.invalid)
			return;

		const { stream, exam } = this.reportsFormGroup.value;

		const selectedExam = this.examsList.find((e) => e.examid === exam);

		this.routeParams.streamId = stream;
		this.routeParams.seriesId = selectedExam?.seriesid || 0;
		this.routeParams.eGroupId = selectedExam?.egroupid || 0;

		this.recentPerformance();
	}

	resetReportForms() {
		this.reportsContainer?.clear();
		this.fetchingExamsDataInProgress = true;
		this.finally.show = false;
		this.reportForms = null!;
	}

	recentPerformance() {
		const userid = this.routeParams.userId;
		const streamId = this.routeParams.streamId;
		const seriesId = this.routeParams.seriesId;
		const examGroupId = this.routeParams.eGroupId;

		let queryParams = "?ts=true&report=true";
		if (streamId > 0) {
			queryParams += "&streamid=" + streamId;
		} else if (userid > 0) {
			queryParams += "&userid=" + userid;
		}

		if (seriesId > 0) {
			queryParams += "&seriesid=" + seriesId;
		} else if (examGroupId > 0) {
			queryParams += "&egroupid=" + examGroupId;
		}

		this.resetReportForms();
		this.reportFormsService.getReportForms(queryParams)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.fetchingExamsDataInProgress = false))
			.subscribe((reportForms) => {
				this.reportForms = reportForms;
				this.noStudentsFound = !(this.reportForms && this.reportForms.students.length > 0);

				const studentsMap: Map<number, StudentReport> = new Map();
				this.reportForms.students.forEach((student, index) => {
					studentsMap.set(index, student);
				});

				setTimeout(() => {
					this.finally.show = true;
					this.buildReportForms(studentsMap);
				}, 0);
			});
	}

	private buildReportForms(studentsMap: Map<number, StudentReport>) {
		this.isCompleteRenderReportForm = false;
		const itemsPerBatch = 5;
		const timeoutInMS = 10;

		const processBatch = (startIndex: number) => {
			const endIndex = Math.min(startIndex + itemsPerBatch, studentsMap.size);

			for (let i = startIndex; i < endIndex; i++) {
				const studentReport = studentsMap.get(i);
				this.reportsContainer.createEmbeddedView(this.studentReport, {
					studentReport,
					studentIndex: i,
				});
			}

			if (endIndex < studentsMap.size) {
				setTimeout(() => processBatch(endIndex), timeoutInMS);
			} else {
				this.isCompleteRenderReportForm = true;
			}
		};

		processBatch(0);
	}

	downloadTemplate() {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "termBalance" },
			{ key: "nextTermFees" },
		];

		// translations
		const fileName = this.translate.instant("printouts.reportForms.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("printouts.reportForms.excelTemplateDownload.workSheetName");

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`printouts.reportForms.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		// const data_template = ["ADMNO", "NAME", "TERM_BALANCE", "NEXT_TERM_FEES"];
		const data_template = [...columns];
		// this.dataService.downloadExcelTemplate(data_template, "Student Fees - Template");
		this.dataService.downloadExcelTemplate(data_template, fileName, workSheetName);
	}

	getCleanedNumber(value: any) {
		value = String(value);
		if (value !== undefined && value !== null) {
			value = value.replace(/\s/g, "");
			value = value.replace(/[^\d.-]/gi, "").trim();
		}
		value = Number(value);
		if (value == null || isNaN(value)) {
			value = 0;
		}
		return value;
	}

	detectFiles(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);

		if (target.files.length !== 1) throw new Error("Cannot use multiple files");
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
			const ab: ArrayBuffer = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(ab);

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			this.feeDataTemp = XLSX.utils.sheet_to_json(ws);
			// this.sheet_headers = this.data[0];

			// this.feeData_Temp.splice(0,1);
			this.feeData = {};

			this.feeDataTemp.forEach((dt: any) => {
				this.feeData[dt.ADMNO] = {};
				this.feeData[dt.ADMNO]["TERM_BALANCE"] = this.getCleanedNumber(dt.TERM_BALANCE);
				this.feeData[dt.ADMNO]["NEXT_TERM_FEES"] = this.getCleanedNumber(dt.NEXT_TERM_FEES);
			});
		};

		reader.readAsArrayBuffer(target.files[0]);
	}

	setClosingDate(date: string) {
		this.closingDate = moment(date).format("yyyy-MM-DD");
	}

	setOpeningDate(date: string) {
		this.openingDate = moment(date).format("yyyy-MM-DD");
	}

	downloadReportForms() {
		this.downloadingReportFormInProgress = true;
		this.downloadReportForms$()
			.pipe(
				this.toastService.observe({
					loading: this.translate.instant("printouts.reportForms.generatingReports", { count: this.reportForms.students.length }),
					success: this.translate.instant("printouts.reportForms.toastMessages.downloadSuccess"),
					error: this.translate.instant("printouts.reportForms.downloadError"),
				})
			)
			.subscribe(() => {
				this.downloadingReportFormInProgress = false;
			}, () => {
				this.downloadingReportFormInProgress = false;
			});
	}

	downloadReportForms$() {
		return new Observable((observer) => {
			console.time("downloadReportForms");
			this.loadedStudentProfiles$.subscribe((studentProfiles) => {
				//wait for loaded student profiles to equal the number of students in the report form
				if (studentProfiles.length === this.reportForms.students.length) {
					const studentPdfDocument = new StudentsPdfReport(
						this.getPdfTitle(),
						this.generateReportFormsContent()
					).getStudentPdfReport();

					console.log("studentPdfDocument", studentPdfDocument);

					this.reportFormsService.downloadReportAsPdf$(studentPdfDocument, this.getPdfTitle()).subscribe(
						() => {
							observer.next();
							console.timeEnd("downloadReportForms");
						},
						() => {
							observer.error();
						});
				}
			});
		});
	}

	private getPdfTitle() {
		let title;
		if (!this.reportForms || !this.reportForms.students.length) {
			title = this.translate.instant("printouts.reportForms.acReportForm");
		} else if (this.reportForms.students.length == 1) {
			title = this.reportForms.students[0].studentName + "'s Report - " + this.reportForms.students[0].currentExam;
		} else {
			title = this.reportForms.students[0].examName;
		}

		return title;
	}

	private generateReportFormsContent() {
		const reportFormContents: any[] = [];
		const optionalReportSections: OptionalReportSections = {
			showClassTeacherRemarks: this.showClassTeacherComments,
			showPrincipalRemarks: this.showPrincipalComments,
			showClassTeacherSignature: this.showClassTeacherSignature,
			showPrincipalSignature: this.showPrincipalSignature,
			showParentSignatureSlot: this.showParentSignature,
			showOverallStudentRank: this.showStudentOverallRank,
			showStreamStudentRank: this.showStudentStreamRank,
			showGPA: this.showGPA,
			showCredentials: this.showCredentials,
			showGradeDescriptors: this.showGradeDescriptors,
		};

		if (this.reportForms) {
			const students = this.reportForms.students;
			const gradingDescriptors = this.reportForms.gradingSystems;
			const principalSignature = this.signaturesInBase64.principal;
			const classTeacherSignature = this.signaturesInBase64.classTeacher;
			const studentProfileImages = this.studentImagesInBase64;
			const studentSubjectComparisonSvgs = this.studentSubjectComparisonSvgs;
			const performanceOverTimeSvgs = this.performanceOverTimeSvgs;

			for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {

				const reportFormContent: ReportFormContentImplementation = new ReportFormContentImplementation(
					this.schoolInfo,
					students[studentIndex],
					this.isLastStudent(studentIndex),
					this.schoolLogoInBase64,
					principalSignature,
					classTeacherSignature,
					studentProfileImages,
					studentSubjectComparisonSvgs[students[studentIndex].userId],
					performanceOverTimeSvgs[students[studentIndex].userId],
					optionalReportSections,
					this.feeData,
					this.datePipe.transform(this.closingDate, "dd MMMM yyyy")!,
					this.datePipe.transform(this.openingDate, "dd MMMM yyyy")!,
					this.schoolTypeData,
					gradingDescriptors,
					this.translate
				);

				reportFormContent.buildReport();

				reportFormContents.push(reportFormContent.getContents());
			}
		}

		return reportFormContents;
	}

	private isLastStudent(studentIndex) {
		return studentIndex == this.reportForms.students.length - 1;
	}

	get studentImagesInBase64() {
		const studentImagesInBase64: { [key: string]: string } = {};

		this.reportForms.students.forEach((student) => {
			const studentImage: any = document.getElementById("img-" + student.userId);
			studentImagesInBase64[student.userId] = imageFromDomToBase64(studentImage);
		});
		return studentImagesInBase64;
	}

	get studentSubjectComparisonSvgs() {
		const studentSubjectComparisonSvgs: { [key: string]: string } = {};

		this.reportForms.students.forEach((student) => {
			const studentSubjectComparisonComponent: any = document.getElementById("subject-comparison-" + student.userId);
			const svg = studentSubjectComparisonComponent.querySelector("svg");
			studentSubjectComparisonSvgs[student.userId] = svg.outerHTML;
		});

		return studentSubjectComparisonSvgs;
	}

	get performanceOverTimeSvgs() {
		const performanceOverTimeSvgs: { [key: string]: string } = {};

		this.reportForms.students.forEach((student) => {
			const performanceOverTimeComponent: any = document.getElementById("performance-over-time-" + student.userId);
			const svg = performanceOverTimeComponent.querySelector("svg");
			performanceOverTimeSvgs[student.userId] = svg.outerHTML;
		});

		return performanceOverTimeSvgs;
	}

	get schoolLogoInBase64() {
		const schoolLogo = document.getElementById("school-logo");
		return imageFromDomToBase64(schoolLogo);
	}

	get signaturesInBase64() {
		const principalSignature = document.getElementById("principal-signature");
		const principal = imageFromDomToBase64(principalSignature, 80, 80);

		const classTeacherSignature = document.getElementById("class-teacher-signature");
		const classTeacher = imageFromDomToBase64(classTeacherSignature, 80, 80);

		return {
			principal,
			classTeacher
		};
	}

	get showPreparingReportMessage() {
		return this.reportForms?.students?.length! > 1 && !this.isCompleteRenderReportForm;
	}

	loadedStudentProfile($event: number) {
		const loadedStudentProfiles = this.loadedStudentProfiles$.getValue();
		this.loadedStudentProfiles$.next([...loadedStudentProfiles, $event]);
	}
}

