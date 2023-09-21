import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { ReportForm } from "../../../../@core/models/evaluation/report-form";
import { SchoolProfile } from "../../../../@core/models/school-info";
import { EvaluationService } from "../../../../@core/services/exams/evaluations/evaluation.service";
import { HotToastService } from "@ngneat/hot-toast";
import { RolesService } from "../../../../@core/shared/services/role/roles.service";
import { Role } from "../../../../@core/models/Role";
import * as XLSX from "xlsx";
import { ActivatedRoute } from "@angular/router";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { OlevelExamSeries } from "src/app/@core/models/olevel/olevel-exam-series";
import {combineLatest, Observable, Subscription} from "rxjs";
import { OlevelIntakeStream } from "src/app/@core/models/olevel/olevel-intake";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import {TermExam} from "../models/term-exam";
import {termName} from "../transcripts/models/olevel-transcript";

interface FormList {
	classlevel: number | string;
	intakeid: number,
	streams: Array<{
		streamid: number,
		name: string,
	}>
}

interface StreamList {
	streamid: number,
	name: string,
}

interface SubjectSummary {
	subjectId: number,
	subjectName: string,
	evaluations: Array<{
		evaluationId: number,
		score: number
	}>,
	competencyAreas: Array<{
		competencyAreaId: number,
		name: string,
	}>
	subjectAverage: number,
	teacherName: string,
	exams: {
		examId: number,
		score: number,
		comment: string,
	}
	comment: string;
	totalScore: number;
}

@Component({
	selector: "app-olevel-report-forms",
	templateUrl: "./olevel-report-forms.component.html",
	styleUrls: ["./olevel-report-forms.component.scss"]
})
export class OLevelReportFormsComponent implements OnInit, OnDestroy {
	reportForm: FormGroup = new FormGroup({
		term: new FormControl(null, [Validators.required]),
		year: new FormControl(null, [Validators.required]),
		rform: new FormControl(null, [Validators.required]),
		stream: new FormControl(null, [Validators.required]),
		exam: new FormControl(null),
		yearSummaryTerms: new FormControl(null),
		yearSummaryExams: new FormControl(null),
	});
	submitted = false;
	schoolTypeData!: SchoolTypeData;
	schoolInfo: SchoolProfile = new SchoolProfile();
	currentFormList: FormList[] = [];
	streamList: StreamList[] = [];
	loading = false;
	evaluationReportForms!: ReportForm;
	academicYears: Array<{ ayid: number, name: string }> = [];
	selectedIntake: number | string = 0;
	selectedStream!: number;
	selectedTerm!: number;
	selectedYear!: string;
	selectedAcademicYear!: number;
	selectedExam!: number;
	userRoles!: Role;
	closingDate: any;
	openingDate: any;
	isMobileApp = false;
	isFileSelected = false;
	feeData_Temp: any;
	feeData: any = {};
	showReportForms = false;
	showClassTeacherComments = true;
	showHouseTeacherComments = false;
	showPrincipalComments = true;
	showClassTeacherSignature = true;
	showHouseTeacherSignature = true;
	showPrincipalSignature = true;
	showExamsSlot = false;
	showAttendanceReport = true;
	showCompetencyAreas = true;
	showProjects = true;
	showActivitiesAndValues = true;
	showSubjectTeacherComments = true;
	showRawScore = true;
	showScoreDescriptor = true;
	showWatermark = true;
	showYearSummaryReport = false;
	showGradeDescriptor = false;

	isLoadingStreamExamSeries = false;
	streamExamSeries: OlevelExamSeries[] = [];
	exams$: Observable<TermExam[]> = new Observable<TermExam[]>();

	examSeriesByStreamSub?: Subscription;

	constructor(private dataService: DataService,
		private schoolService: SchoolService,
		private evaluationService: EvaluationService,
		private toastService: HotToastService,
		private rolesService: RolesService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute) {
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});

		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});

		this.dataService.schoolData.subscribe((data: SchoolTypeData) => {
			this.schoolTypeData = data;
			this.currentFormList = data?.current_forms_list;
			data?.graduated_forms_list.forEach((form) => {
				const existingIntakes = this.currentFormList.map((formList) => formList.intakeid);
				if (!existingIntakes.includes(form.intakeid)) {
					this.currentFormList.push({
						classlevel: form.graduationYear,
						intakeid: form.intakeid,
						streams: form.streams
					});
				}
			});
		});
	}

	ngOnInit(): void {
		this.isMobileApp = this.dataService.getIsMobileApp();
		const { acadYear, term, stream, student } = this.activatedRoute.snapshot.queryParams;
		if (acadYear && term && stream) {
			this.selectedStream = stream;
			this.selectedTerm = term;
			this.selectedAcademicYear = acadYear;
			this.reportForm.patchValue({
				term: term,
				year: acadYear,
			});
			this.getReportForms(false);
		}

		if (acadYear && term && student) {
			this.selectedTerm = term;
			this.selectedAcademicYear = acadYear;
			this.reportForm.patchValue({
				term: term,
				year: acadYear,
			});
			this.getStudentReportForm(student);
		}

		this.evaluationService.getAcademicYears().subscribe(({academicYears}) => {
			this.academicYears = academicYears.map(({academicYearId, beginYear}) => {
				return {
					ayid: academicYearId,
					name: beginYear.toString()
				};
			});

			this.reportForm.controls["rform"].valueChanges.subscribe((value) => {
				this.updateStreams(value);
			});
		});

		this.onShowClassTeacherCommentsChange();
		this.onShowHouseTeacherCommentsChange();
		this.onShowPrincipalCommentsChange();
		this.onAcademicYearChangeOrStreamChange();

	}

	ngOnDestroy(): void {
		this.submitted = false;
		this.showReportForms = false;
		this.examSeriesByStreamSub?.unsubscribe();
	}

	get f(): { [key: string]: AbstractControl } {
		return this.reportForm.controls;
	}

	onIntakeStreamChanged(stream: OlevelIntakeStream) {
		this.resetExamField();
		this.retrieveExamSeriesByStream(stream.streamid);
	}

	onTermChanged() {
		const stream = this.reportForm.value["stream"];
		if (stream) {
			this.resetExamField();
			this.retrieveExamSeriesByStream(stream);
		}
	}

	onSeniorChanged() {
		this.resetExamField();
	}

	onExamChanged(exam: {seriesName: string; seriesId: number}) {
		this.showExamsSlot = exam ? true : false;
	}

	private onAcademicYearChangeOrStreamChange() {
		const academicYearChange$ = this.f["year"]?.valueChanges as Observable<number>;
		const streamChange$ = this.f["stream"]?.valueChanges as Observable<number>;

		combineLatest([academicYearChange$, streamChange$]).subscribe(([academicYearId, streamId]) => {
			if (academicYearId && streamId) {
				this.exams$ = this.evaluationService.getExamsPerAcademicYearAndStream(academicYearId, streamId);
			}
		});
	}

	private retrieveExamSeriesByStream(streamID: number) {
		const academicYearID = this.reportForm.value["year"];
		const term = this.reportForm.value["term"];

		this.isLoadingStreamExamSeries = true;
		this.resetExamField();

		this.examSeriesByStreamSub = this.evaluationService.getExamSeriesByStream(streamID, academicYearID, term).subscribe({
			next: (res: OlevelExamSeries[]) => {
				this.streamExamSeries = res;
				this.isLoadingStreamExamSeries = false;
			},
			error: () => {
				this.translate.instant("printouts.assessments.toastMessages.retrieveExamSeriesError");
				this.isLoadingStreamExamSeries = false;
			},
		});
	}

	private resetExamField() {
		this.streamExamSeries = [];
		this.reportForm.controls["exam"]?.reset();
	}

	detectFiles(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		target.files.length == 1 ? this.isFileSelected = true : this.isFileSelected = false;
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
			this.feeData_Temp = XLSX.utils.sheet_to_json(ws,);
			this.feeData = {};

			this.feeData_Temp.forEach((dt: any) => {
				this.feeData[dt.ADMNO] = {};
				this.feeData[dt.ADMNO]["TERM_BALANCE"] = this.getCleanedNumber(dt.TERM_BALANCE);
				this.feeData[dt.ADMNO]["NEXT_TERM_FEES"] = this.getCleanedNumber(dt.NEXT_TERM_FEES);
			});
		};

		reader.readAsArrayBuffer(target.files[0]);
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

	downloadTemplate() {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "termBalance" },
			{ key: "nextTermFees" },
		];

		// translations
		const fileName = this.translate.instant("printouts.oLevelRForm.options.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("printouts.oLevelRForm.options.excelTemplateDownload.workSheetName");

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`printouts.oLevelRForm.options.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		// const data_template = ["ADMNO", "NAME", "TERM_BALANCE", "NEXT_TERM_FEES"];
		const data_template = [...columns];
		// this.dataService.downloadExcelTemplate(data_template, "Student Fees - Template");
		this.dataService.downloadExcelTemplate(data_template, fileName, workSheetName);
	}

	getReportForms(fromForm = true) {
		if (fromForm) {
			this.submitted = true;
			if (this.reportForm.invalid) {
				return;
			}
		}

		this.showReportForms = false;
		this.evaluationReportForms = null!;

		this.loading = true;
		const evaluationBtn = document.getElementsByClassName("eval-btn") as HTMLCollectionOf<HTMLElement>;
		evaluationBtn[0].classList.add("box-btn-slide-close");

		const { term, year, stream, rform, exam, yearSummaryTerms, yearSummaryExams } = this.reportForm.value;
		if (fromForm) {
			this.selectedStream = stream;
			this.selectedTerm = term;
			this.selectedAcademicYear = year;
			this.selectedExam = exam;
			this.selectedIntake = this.currentFormList.find((f) => f.intakeid === rform)?.classlevel!;
		}

		this.selectedYear = this.academicYears?.find((ay) => ay.ayid === this.selectedAcademicYear)?.name!;
		const yearSummaryTermsString = yearSummaryTerms?.length ? JSON.stringify(yearSummaryTerms) : "";
		const yearSummaryExamsString = yearSummaryExams?.length ? JSON.stringify(yearSummaryExams) : "";

		this.evaluationService.getEvaluationReportForms(this.selectedAcademicYear, this.selectedTerm, this.selectedStream, this.selectedExam, yearSummaryTermsString, yearSummaryExamsString).subscribe((reportForms) => {
			evaluationBtn[0].click();
			this.evaluationReportForms = reportForms;
			this.showReportForms = reportForms.students.length > 0;

			// console.log(reportForms
			this.loading = false;
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private getStudentReportForm(studentId: any) {
		this.showReportForms = false;
		this.evaluationReportForms = null!;

		this.loading = true;
		const evaluationBtn = document.getElementsByClassName("eval-btn") as HTMLCollectionOf<HTMLElement>;
		evaluationBtn[0].classList.add("box-btn-slide-close");

		this.selectedYear = this.academicYears?.find((ay) => ay.ayid === this.selectedAcademicYear)?.name!;
		this.evaluationService.getEvaluationReportFormForStudent(this.selectedAcademicYear, this.selectedTerm, studentId).subscribe((reportForms) => {
			evaluationBtn[0].click();
			this.evaluationReportForms = reportForms;
			this.showReportForms = reportForms.students.length > 0;

			// console.log(reportForms
			this.loading = false;
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private updateStreams(intakeId) {
		this.streamList = this.currentFormList?.find(i => i.intakeid == intakeId)?.streams!;
		this.reportForm.controls["stream"].setValue(null);
	}

	get termNameFromSelectedTerms() {
		const selectedTerms = this.reportForm.value.yearSummaryTerms;
		const name = termName(selectedTerms || []);
		return name ? "Term " + name : "";
	}

	onShowClassTeacherCommentsChange() {
		this.showClassTeacherSignature = this.showClassTeacherComments;
	}
	onShowClassTeacherSignatureChange() {
		if (!this.showClassTeacherComments) {
			this.showClassTeacherComments = this.showClassTeacherSignature;
		}
	}

	onShowHouseTeacherCommentsChange() {
		this.showHouseTeacherSignature = this.showHouseTeacherComments;
	}
	onShowHouseTeacherSignatureChange() {
		if (!this.showHouseTeacherComments) {
			this.showHouseTeacherComments = this.showHouseTeacherSignature;
		}
	}

	onShowPrincipalCommentsChange() {
		this.showPrincipalSignature = this.showPrincipalComments;
	}
	onShowPrincipalSignatureChange() {
		if (!this.showPrincipalComments) {
			this.showPrincipalComments = this.showPrincipalSignature;
		}
	}

	onShowGradeDescriptorChange() {
		if (this.showGradeDescriptor) {
			this.showYearSummaryReport = true;
		}
	}

	onShowYearSummaryReportChange() {
		if (!this.showYearSummaryReport) {
			this.showGradeDescriptor = false;
		}
	}
}
