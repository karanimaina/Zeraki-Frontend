import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../../@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { IntakeAssessmentReport } from "../../../../@core/models/evaluation/assessment-report";
import { EvaluationService } from "../../../../@core/services/exams/evaluations/evaluation.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { Observable, Subscription } from "rxjs";
import { OlevelExamReport } from "src/app/main/printouts/olevels/models/olevel-exam-report";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { ExcelTemplateHeader } from "src/app/@core/models/excel/excel-template-header";
import { UtilService } from "src/app/@core/shared/services/util.service";
import { environment } from "src/environments/environment";
import { ICreatePDF } from "pdfmake-wrapper";
import * as saveAs from "file-saver";
import { OlevelExamSeries } from "src/app/@core/models/olevel/olevel-exam-series";
import { OlevelIntake, OlevelIntakeStream } from "src/app/@core/models/olevel/olevel-intake";
import { PrintoutsService } from "src/app/@core/services/printouts/printouts.service";
import { ExcelService } from "src/app/@core/shared/services/excel/excel.service";
import { AssessmentType } from "src/app/@core/enums/assessments/assessment-type";


@Component({
	selector: "app-assessments",
	templateUrl: "./assessments.component.html",
	styleUrls: ["./assessments.component.scss"]
})
export class AssessmentsComponent implements OnInit, OnDestroy {
	readonly AssessmentType = AssessmentType;

	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	school: any;
	school_logo_path: any;
	schoolProfileSub!: Subscription;

	academicYears: Array<{ ayid: number, name: string }> = [];
	assessmentForm = this.fb.group({
		assessmentType: [null, Validators.required],
		intakeId: [null, Validators.required],
		term: [null, Validators.required],
		year: [null, Validators.required],
	});

	assessmentForm2 = this.fb.group({
		stream: [null],
		exam: [null, Validators.required],
	});

	isRetrievingAcademicYears = false;
	submitted = false;
	loading = false;
	schoolTypeData?: SchoolTypeData;
	currentIntakeList: OlevelIntake[] = [];
	intakeStreams: OlevelIntakeStream[] = [];
	isLoadingStreamExamSeries = false;
	examSeries: OlevelExamSeries[] = [];
	isRetrievingExamReport = false;
	examReport?: OlevelExamReport;
	examReportTableHeader = "Exam Report";

	assessmentReport!: IntakeAssessmentReport;
	assessmentTypes: { name: any; value: number }[] = [];
	selectedAssessmentType?: AssessmentType;
	activeSubject!: number;

	defaultIntake!: number;
	defaultTerm!: number;
	defaultYear!: number;

	showExamAdditionalFields = false;

	createdPDF?: ICreatePDF;
	isExportingPdf = false;
	isExportingExcel = false;

	examSeriesByStreamSub?: Subscription;
	examReportSub?: Subscription;
	schoolTypeDataSub?: Subscription;

	get studentResultsAbsent() {
		return this.examReport && this.examReport.studentsResults.length === 0;
	}

	constructor(
		private rolesService: RolesService,
		private dataService: DataService,
		private translate: TranslateService,
		private evaluationService: EvaluationService,
		private printoutsService: PrintoutsService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private toastService: HotToastService,
		private utilService: UtilService,
		private fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.getSchoolProfile();
		this.setAssessmentTypes();
		this.setSchoolYears();
		this.getSchoolTypeData();
	}

	private getSchoolProfile() {
		this.schoolProfileSub = this.dataService.getSchoolProfile().subscribe(resp => {
			this.school = resp;

			const image_root = environment.apiurl + "/groups/images/";
			if (this.school.logo !== undefined && this.school.logo !== null && this.school.logo.length > 0) {
				if (this.school.logo.includes("http")) {
					this.school_logo_path = this.school.logo;
				} else {
					this.school_logo_path = image_root + this.school.logo;
				}
			} else {
				this.school_logo_path = "../../../../assets/img/default-logo.png";
			}
		});
	}

	private setAssessmentTypes() {
		this.assessmentTypes = [
			{
				name: this.translate.instant("evaluation.topNav.evaluations"),
				value: 1
			},
			{
				name: this.translate.instant("evaluation.topNav.projects"),
				value: 2
			},
			{
				name: this.translate.instant("evaluation.topNav.exams"),
				value: 3
			}
		];
	}

	private setSchoolYears() {
		this.isRetrievingAcademicYears = true;

		this.evaluationService.getAcademicYears().subscribe(({ academicYears }) => {
			this.academicYears = academicYears.map((acyr) => {
				return {
					ayid: acyr.academicYearId,
					name: acyr.beginYear.toString()
				};
			});

			this.isRetrievingAcademicYears = false;
		}, () => {
			const msg = this.translate.instant("common.toastMessages.getAcademicYearsError");
			this.toastService.error(msg);

			this.isRetrievingAcademicYears = false;
		});
	}

	private getSchoolTypeData() {
		this.schoolTypeDataSub = this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
			this.currentIntakeList = schoolTypeData?.current_forms_list;

			this.setDefaultAssessmentFormValues();

			const intakeID = this.assessmentForm.value["intakeId"];
			this.setIntakeStreams(intakeID);

			schoolTypeData?.graduated_forms_list.forEach((form) => {
				const existingIntakes = this.currentIntakeList.map((formList) => formList.intakeid);
				if (!existingIntakes.includes(form.intakeid)) {
					this.currentIntakeList.push({
						classlevel: form.graduationYear,
						intakeid: form.intakeid
					});
				}
			});
		});
	}

	private setDefaultAssessmentFormValues() {
		this.defaultIntake = parseInt(this.activatedRoute.snapshot.queryParams.intake);
		this.defaultTerm = parseInt(this.activatedRoute.snapshot.queryParams.term);
		this.defaultYear = parseInt(this.activatedRoute.snapshot.queryParams.acyr);
		this.selectedAssessmentType = parseInt(this.activatedRoute.snapshot.queryParams.type);

		if (this.defaultIntake && this.defaultTerm && this.defaultYear && this.selectedAssessmentType) {
			this.assessmentForm.patchValue({
				assessmentType: this.selectedAssessmentType,
				term: this.defaultTerm,
				year: this.defaultYear,
				intakeId: this.defaultIntake
			});

			this.getIntakeAssessmentReport(this.defaultIntake, this.defaultTerm, this.defaultYear);
		}
	}

	private setIntakeStreams(intakeID: number) {
		const foundIntake = this.currentIntakeList?.find(intake => intake.intakeid === intakeID);

		if (foundIntake) {
			if (foundIntake.streams) this.intakeStreams = foundIntake.streams;
		}
	}

	get f(): { [key: string]: AbstractControl } {
		return this.assessmentForm.controls;
	}
	get f2(): { [key: string]: AbstractControl } {
		return this.assessmentForm2.controls;
	}

	onAssessmentTypeChanged(assessmentType: { name: string, value: number }) {
		if (assessmentType.value === 3) {
			this.showExamAdditionalFields = true;
		} else {
			this.showExamAdditionalFields = false;
		}
	}

	onIntakeChanged(intake: OlevelIntake) {
		if (intake.streams) {
			this.resetStreamField();
			this.intakeStreams = intake.streams;

			const academicYearID = this.f["year"].value;
			const term = this.f["term"].value;

			if (academicYearID && term) {
				const intakeID = this.f["intakeId"].value;
				const streamID = this.f2["stream"].value;

				if (intakeID || streamID) {
					this.retrieveExamSeries(streamID, intakeID);
				}
			}

		}
	}

	onAcademicYearOrTermChanged() {
		const intakeID = this.f["intakeId"].value;
		const streamID = this.f2["stream"].value;

		if (intakeID || streamID) {
			this.retrieveExamSeries(streamID, intakeID);
		}
	}

	private resetStreamField() {
		this.assessmentForm2.controls["stream"]?.reset();
	}

	onIntakeStreamChanged(stream: OlevelIntakeStream) {
		const academicYearID = this.f["year"].value;
		const term = this.f["term"].value;

		if (academicYearID && term) this.retrieveExamSeries(stream.streamid);
	}

	onIntakeStreamCleared() {
		const intakeID = this.f["intakeId"].value;
		const streamID = this.f2["stream"].value;

		this.retrieveExamSeries(streamID, intakeID);
	}

	private resetExamField() {
		this.examSeries = [];
		this.assessmentForm2.controls["exam"]?.reset();
	}

	private retrieveExamSeries(streamID: number, intakeID?: number) {
		const academicYearID = this.assessmentForm.value["year"];
		const term = this.assessmentForm.value["term"];

		this.isLoadingStreamExamSeries = true;
		this.resetExamField();

		this.examSeriesByStreamSub = this.evaluationService.getExamSeriesByStream(streamID, academicYearID, term, intakeID).subscribe({
			next: (res: OlevelExamSeries[]) => {
				this.examSeries = res;
				this.isLoadingStreamExamSeries = false;
			},
			error: () => {
				this.translate.instant("printouts.assessments.toastMessages.retrieveExamSeriesError");
				this.isLoadingStreamExamSeries = false;
			},
		});
	}

	onAssessmentFormSubmit() {
		const isAssessmentExam = this.assessmentForm.value["assessmentType"] === 3;

		this.assessmentForm.markAllAsTouched();
		if (this.assessmentForm.invalid) {
			if (isAssessmentExam) this.assessmentForm2.markAllAsTouched();
			return;
		}

		if (isAssessmentExam) this.assessmentForm2.markAllAsTouched();
		if (isAssessmentExam && this.assessmentForm2.invalid) return;

		// Form values
		this.defaultIntake = this.assessmentForm.value["intakeId"];
		this.defaultTerm = this.assessmentForm.value["term"];
		this.defaultYear = this.assessmentForm.value["year"];

		// Default assessment type
		this.selectedAssessmentType = this.assessmentForm.value.assessmentType;

		const streamID = this.assessmentForm2.value["stream"];
		const examSeriesID = this.assessmentForm2.value["exam"];

		if (isAssessmentExam) { // exams
			this.retrieveExamReport(examSeriesID, streamID, this.defaultIntake);
		} else { // evaluations and projects
			this.getIntakeAssessmentReport(this.defaultIntake, this.defaultTerm, this.defaultYear);
		}

	}

	private retrieveExamReport(seriesID: number, streamID: number, intakeID: number) {
		this.isRetrievingExamReport = true;

		this.examReportSub = this.evaluationService.getExamReport(seriesID, streamID, intakeID).subscribe({
			next: (res: OlevelExamReport) => {
				this.examReport = res;

				const intakeName = this.utilService.translateFormOrYear(<string>this.schoolTypeData?.formoryear);
				const classLevel = this.examReport?.classLevel;
				const stream = this.examReport?.stream;
				const examName = this.examReport?.examName;
				const academicYear = this.examReport?.academicYear;
				const termText = this.translate.instant("common.term");
				const termValue = this.examReport?.term;

				this.examReportTableHeader = `${intakeName} ${classLevel} ${stream ?? ""} - ${examName} (${academicYear} ${termText} ${termValue})`;

				this.toggleAssessmentSection();
				this.isRetrievingExamReport = false;
			},
			error: () => {
				this.translate.instant("printouts.assessments.toastMessages.retrieveExamReportError");
				this.isRetrievingExamReport = false;
			}
		});
	}

	private getIntakeAssessmentReport(intakeID: number, term: number, year: number) {
		this.loading = true;

		this.evaluationService.getIntakeAssessmentReport(intakeID, term, year).subscribe((assessmentReport) => {
			this.loading = false;
			this.assessmentReport = assessmentReport;
			this.toggleAssessmentSection();
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	showAssessments(subjectId: number) {
		if (this.activeSubject === subjectId) {
			this.activeSubject = null!;
		} else {
			this.activeSubject = subjectId;
		}
	}

	private toggleAssessmentSection() {
		const evaluationBtn = document.getElementsByClassName("assessments-btn") as HTMLCollectionOf<HTMLElement>;
		evaluationBtn[0].classList.add("box-btn-slide-close");

		evaluationBtn[0].click();
	}

	viewClassAssessment(classId: number, projectId: number, isSubjectTeacher: boolean, streamId: number) {
		if (this.selectedAssessmentType === AssessmentType.EVALUATION) {
			this.router.navigate(["/main/evaluation/all"], { queryParams: { class: classId } });
		} else if (this.selectedAssessmentType === AssessmentType.PROJECT) {
			this.router.navigate(["/main/evaluation/manage", projectId], { queryParams: { class: classId, str: streamId, type: "project", iST: isSubjectTeacher } });
		} else if (this.selectedAssessmentType === AssessmentType.EXAM) {
			this.router.navigate(["/main/evaluation/manage", projectId], { queryParams: { class: classId, str: streamId, type: "exam", iST: isSubjectTeacher } });
		}
	}

	hasAssessments(stream): boolean {
		return this.selectedAssessmentType == AssessmentType.EVALUATION ? stream.evaluation : stream.projects;
	}

	get selectedAssessmentTypeTranslated(): string {
		let assessmentType = "";

		switch (this.selectedAssessmentType) {
		case AssessmentType.EVALUATION:
			assessmentType = this.translate.instant("evaluation.topNav.evaluations");
			break;
		case AssessmentType.PROJECT:
			assessmentType = this.translate.instant("evaluation.topNav.projects");
			break;
		case AssessmentType.EXAM:
			assessmentType = this.translate.instant("evaluation.topNav.exams");
			break;
		default:
			assessmentType = "";
			break;
		}

		return assessmentType;
	}

	get isDownloadingReport(): boolean {
		return this.isExportingExcel || this.isExportingPdf;
	}

	downloadExamReportAsExcel() {
		const excelFileName = this.examReport?.generatedSpreadsheet;

		if (excelFileName) {
			this.backendExcelDownload(excelFileName);
		} else {
			this.frontendExcelDownload();
		}

	}

	backendExcelDownload(fileName: string) {
		this.isExportingExcel = true;

		this.printoutsService.getExcel_A_reports("analytics/examspreadsheet?name=" + fileName).subscribe({
			next: (res: any) => {
				const blob = new Blob([res], { type: "application/vnd.ms-excel" });
				saveAs(blob, fileName);
				this.isExportingExcel = false;
			},
			error: () => {
				this.translate.instant("printouts.assessments.toastMessages.excelDownloadError");
				this.isExportingExcel = false;
			}
		});
	}

	frontendExcelDownload() {
		this.isExportingExcel = true;

		const fileName = this.examReportTableHeader;
		const workSheetName = this.translate.instant("workSheet.defaults.worksheetName");
		let columnHeaders: ExcelTemplateHeader[] = [];
		const entries: any[] = [];

		const defaultHeaderWidth = 10;

		const excelColHeaders = this.examReport?.columnLabels.map(columnLabel => {
			let headerWidth = defaultHeaderWidth;

			if (columnLabel.toUpperCase() === "NAME") {
				headerWidth = 15;
			} else {
				headerWidth = columnLabel.length ? columnLabel.length + 1 : defaultHeaderWidth;
			}

			const header: ExcelTemplateHeader = {
				key: columnLabel.toUpperCase(),
				value: columnLabel.toUpperCase(),
				width: headerWidth,
			};

			return header;
		});

		if (excelColHeaders) {
			columnHeaders = [...excelColHeaders];
		}

		this.examReport?.studentsResults.forEach((studentResult) => {
			const studentExcelEntry: any[] = [];

			this.examReport?.columnLabels.forEach((columnLabel) => {
				studentExcelEntry.push(studentResult[columnLabel]?.toString());
			});

			entries.push(studentExcelEntry);
		});

		const excelService = new ExcelService(fileName, workSheetName, columnHeaders, entries);

		excelService.downloadExcelTemplate();
		this.isExportingExcel = false;
	}

	async exportExamReportToPDF(action: "print" | "download") {
		this.isExportingPdf = true;

		const pdfTitle = this.examReportTableHeader;
		const docHeaders: string[] = [];
		const docLabels: string[] = [];

		this.examReport?.columnLabels.forEach((item: string) => {
			docHeaders.push(item.toUpperCase());
			docLabels.push(item);
		});

		const columnCount = docHeaders.length;

		/* STUDENT MERIT LIST */
		const exportList = [...this.examReport!.studentsResults];
		const table: any[][] = [];

		table.push([
			{ text: pdfTitle, colSpan: columnCount, alignment: "center" },
			...Array(columnCount - 1).fill("")
		]); // table header 1
		table.push(docHeaders); // table header 2

		exportList.forEach((item: any) => {
			const itemKeys = Object.keys(item);

			const itemSubjects: any[] = [];

			itemKeys.forEach(itemKey => {
				const val = item[itemKey];
				if (typeof val === "object") {
					itemSubjects.push({
						name: itemKey,
						value: val,
					});
				}
			});

			const rowItemsToAdd: string[] = [];

			docLabels.forEach(doc_label => {
				const foundItemSubject = itemSubjects.find(itemSubject => itemSubject.name === doc_label);

				let rowItemToAdd = "";

				if (foundItemSubject) {
					rowItemToAdd = `${foundItemSubject.value.score_grade}`;
				} else {
					if (typeof item[doc_label] == "number" && (doc_label == "improvement" || doc_label == "mean" || doc_label == "vap")) {
						// TODO: 1 Convert to 2 decimal places.
						rowItemToAdd = `${item[doc_label].toFixed(2) ?? ""}`;
					} else {
						rowItemToAdd = `${item[doc_label] ?? ""}`;
					}
				}

				rowItemsToAdd.push(rowItemToAdd);

			});

			table.push([...rowItemsToAdd]);
		});


		/* FINAL: PDF GENERATION */
		const title: string = this.translate.instant("printouts.meritList.title");
		const titleFormatted = title.replace(" ", "-");
		const fullPdfTitle = `${titleFormatted}_${pdfTitle}`;

		try {
			this.createdPDF = await this.printoutsService.generateOlevelExamPdfReport(
				this.school,
				this.school_logo_path,
				pdfTitle,
				[
					// merit list
					{
						table,
						tableWidths: [
							// ...Array(columnCount).fill("auto"),
							"*",
							75,
							...Array(columnCount - 2).fill("*"),
						],
					},
				],
				"A4"
			);

			if (action === "print") {
				this.createdPDF?.print();
			} else {
				this.createdPDF?.download(`${fullPdfTitle}`);

				const msg = this.translate.instant("printouts.meritList.toastMessages.generatePdfSuccess", { title: fullPdfTitle });
				this.toastService.success(msg);
			}
		} catch (error) {
			const msg = this.translate.instant("printouts.meritList.toastMessages.generatePdfError", { title: fullPdfTitle });
			this.toastService.error(msg);
		}

		this.isExportingPdf = false;
	}

	ngOnDestroy(): void {
		this.examSeriesByStreamSub?.unsubscribe();
		this.examReportSub?.unsubscribe();
		this.schoolTypeDataSub?.unsubscribe();
	}

}
