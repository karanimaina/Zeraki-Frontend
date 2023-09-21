import {
	AfterContentChecked,
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges
} from "@angular/core";
import { SchoolInfo } from "../../../../../../@core/models/school-info";
import { DataService } from "../../../../../../@core/shared/services/data/data.service";
import { ReportForm } from "../../../../../../@core/models/evaluation/report-form";
import { BehaviorSubject, Observable } from "rxjs";
import { ReportFormIdentifiers } from "../../../../../../@core/models/evaluation/report-form-identifiers";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { CompetencyArea } from "src/app/@core/models/evaluation/competency-area";
import { TranslateService } from "@ngx-translate/core";
import * as pdfMake from "pdfmake/build/pdfmake";
import { ReportFormPdfDocument } from "../../models/report-form-pdf-document";
import { OptionalPdfSections } from "../../models/optional-pdf-sections";
import { HotToastService } from "@ngneat/hot-toast";
import pdfFonts from "src/assets/pdf/fonts/pdf-make-opensans";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import {SubjectReport} from "../../models/subject-report";
import {StudentReport} from "../../models/student-report";
import {computeCompetencyAreaResults, computeTopicResults} from "../../../helpers/results-computations";
import {ExtractImagesFromDomComponent} from "../extract-images-from-dom/extract-images-from-dom.component";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: "app-student-report",
	templateUrl: "./student-report.component.html",
	styleUrls: ["./student-report.component.scss"]
})
export class StudentReportComponent extends ExtractImagesFromDomComponent implements OnInit, OnChanges, AfterContentChecked {
	students: Array<StudentReport> = [];
	@Input() showReportForms!: boolean;
	@Input() showClassTeacherComments!: boolean;
	@Input() showHouseTeacherComments!: boolean;
	@Input() showPrincipalComments!: boolean;
	@Input() showClassTeacherSignature!: boolean;
	@Input() showHouseTeacherSignature!: boolean;
	@Input() showPrincipalSignature!: boolean;
	@Input() showExamsSlot!: boolean;
	@Input() showAttendanceReport!: boolean;
	@Input() showCompetencyAreas!: boolean;
	@Input() showSubjectTeacherComments!: boolean;
	@Input() showProjects!: boolean;
	@Input() showActivitiesAndValues!: boolean;
	@Input() showRawScore!: boolean;
	@Input() showScoreDescriptor!: boolean;
	@Input() showWatermark!: boolean;
	@Input() showYearSummaryReport!: boolean;
	@Input() showGradeDescriptor!: boolean;
	@Input() openingDate: any;
	@Input() closingDate: any;
	@Input() fromReportForms = true;
	@Input() studentAverage: BehaviorSubject<number> = new BehaviorSubject<number>(null!);
	@Input() studentDetails: BehaviorSubject<{ studentId: number, studentAdmNo: string, studentName: string, currentStream: string }> = new BehaviorSubject<{ studentId: number; studentAdmNo: string; studentName: string, currentStream: string }>(null!);
	@Input() feeData: any = {};
	@Input() reportForms!: ReportForm;
	@Input() summayReportTermName!: string;

	schoolInfo!: SchoolInfo;
	schoolTypeData!: SchoolTypeData;
	reportFormIdentifiers!: ReportFormIdentifiers;
	printFontSize = 12;
	orientation: "portrait" | "landscape" = "portrait";

	isDownloadingAsPdf = false;

	constructor(
		private schoolService: SchoolService,
		private dataService: DataService,
		private translate: TranslateService,
		private cdref: ChangeDetectorRef,
		private toastService: HotToastService) {
		super();
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});

		this.dataService.schoolData.subscribe((data: SchoolTypeData) => {
			this.schoolTypeData = data;
		});
	}

	ngOnInit(): void { }

	ngOnChanges(changes: SimpleChanges) {
		const { closingDate, openingDate, reportForms, feeData } = changes;
		if (closingDate) {
			this.closingDate = closingDate.currentValue;
		}

		if (openingDate) {
			this.openingDate = openingDate.currentValue;
		}

		if (reportForms) {
			this.formatReportFormData();
		}

		if (feeData) {
			this.feeData = feeData.currentValue;
		}
	}

	formatReportFormData() {
		const subjects: Map<number, any> = new Map<number, any>();
		this.students = [];
		this.studentAverage.next(null!);

		this.reportFormIdentifiers = this.reportForms.identifier;

		this.reportForms.subjects.forEach((subject) => {
			subjects.set(subject.subjectId, subject);
		});

		this.reportForms.students.forEach((student) => {
			const studentSubjects: Array<any> = [];
			for (const subject of student.subjects) {
				const foundStudentSubject = this.reportForms.subjects.find(s => s.subjectId === subject.subjectId);
				if (foundStudentSubject) {
					studentSubjects.push(foundStudentSubject);
				}
			}

			const subjects: Array<SubjectReport> = [];

			studentSubjects.forEach(s => {
				const subjectAverage = this.getSubjectAverage(s.subjectId, student.studentId);
				//Only get topics that have results
				const topicResults = computeTopicResults(student.evaluations, s.topics, s.subjectId, this.reportForms.subjects);

				let totalCompetencyAreas = 0;
				topicResults.forEach(t => {
					totalCompetencyAreas += t.competencyAreas.length;
				});

				subjects.push(<SubjectReport>{
					subjectId: s.subjectId,
					subjectName: s.subjectName,
					competencyAreas: computeCompetencyAreaResults(student.evaluations, s.competencyAreas),
					topics: topicResults,
					totalCompetencyAreas: totalCompetencyAreas,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					evaluations: this.getEvaluations(s.subjectId, student.studentId, s.competencyAreas),
					teacherName: subjectAverage ? subjectAverage?.teacherName : "",
					cbcSubjectAverage: subjectAverage ? subjectAverage.cbcSubjectAverage : null,
					rawSubjectAverage: subjectAverage ? subjectAverage.rawSubjectAverage : null,
					comment: subjectAverage ? subjectAverage.comment : null,
					remarkId: subjectAverage ? subjectAverage.remarkId : null,
					generalComment: subjectAverage ? subjectAverage.generalComment : null,
					subjectComment: subjectAverage ? subjectAverage.subjectComment : null,
					exams: this.getExamResults(s.subjectId, student.exams),
				});
			});

			this.studentAverage.next(Number(student.evaluationAverage));
			this.students.push({
				profileUrl: student.profileUrl,
				studentId: student.studentId,
				studentName: student.studentName,
				studentAdmNo: student.studentAdmNo,
				evaluationAverage: student.evaluationAverage,
				subjects: subjects,
				evaluationAverages: this.getEvaluationAverages(student.studentId),
				attendance: student.attendance,
				classTeacherComment: student.classTeacherComment,
				houseTeacherComment: student.houseTeacherComment,
				principalComment: student.principalComment,
				projects: student.projects,
				studentActivities: student.studentActivities,
				yearSummary: student.yearSummary,
			});
		});
	}

	get showPrintButton() {
		return this.fromReportForms && this.showReportForms;
	}

	private getSubjectAverage(subjectId: number, studentId: number): {
		subjectId: number;
		cbcSubjectAverage: number;
		rawSubjectAverage: number;
		comment: string;
		teacherName: string;
		remarkId: number;
		generalComment: string;
		subjectComment: string;
	} {
		return this.reportForms?.students.find(s => s.studentId === studentId)?.subjectsAverages?.find(sA => sA.subjectId === subjectId)!;
	}

	private getEvaluations(subjectId: number, studentId: number, competencyAreas: Array<CompetencyArea>) {
		return this.reportForms?.evaluationSeries.map(evalSeries => {
			return {
				evaluationId: evalSeries.seriesId,
				score: this.reportForms?.students.find(s => s.studentId === studentId)
					?.evaluations.find(e => e.evaluationSeriesId === evalSeries.seriesId)?.results.find(r => r.subjectId === subjectId)?.score,
				competencyAreas: competencyAreas.map((ca, index) => {
					return {
						competencyAreaId: ca.competencyAreaId,
						score: this.reportForms?.students.find(s => s.studentId === studentId)
							?.evaluations.find(e => e.evaluationSeriesId === evalSeries.seriesId)?.results.find(r => r.competencyId === ca.competencyAreaId)?.score
					};
				})
			};
		});
	}

	private getEvaluationAverages(studentId: number): Array<{ evaluationId: number, cbcScoreAverage: number, rawScoreAverage: number }> {
		return this.reportForms?.evaluationSeries.map(evalSeries => {
			const { cbcScoreAverage, rawScoreAverage } = this.reportForms?.students.find(s => s.studentId === studentId)
				?.evaluations?.find(e => e.evaluationSeriesId === evalSeries.seriesId)!;

			return {
				evaluationId: evalSeries.seriesId!,
				cbcScoreAverage,
				rawScoreAverage
			};
		});
	}

	private getExamResults(subjectId: number, exams: { examId: number; examName: string; results: Array<{ subjectId: number; factId: number; score: number; comment: string }> }) {
		const score = exams?.results.find(r => r.subjectId === subjectId)?.score;
		const comment = exams?.results.find(r => r.subjectId === subjectId)?.comment;
		return {
			examId: exams?.examId,
			score: score ? score : null,
			comment: comment ? comment : ""
		};
	}

	/* REPORT FORMS PDF DOWNLOAD */

	downloadAsPdf(orientation: "portrait" | "landscape" = "portrait") {
		this.orientation = orientation;
		this.isDownloadingAsPdf = true;
		this.downloadAsPdf$()
			.pipe(
				this.toastService.observe(
					{
						loading: "Downloading Report Forms",
						success: "Report Forms Downloaded",
						error: "Error Downloading Report Forms"
					}
				)
			).subscribe(() => {
				this.isDownloadingAsPdf = false;
			}, () => {
				this.isDownloadingAsPdf = false;
			});
	}

	downloadAsPdf$() {
		const pdfDocument = this.generateReportFormPdfContent();

		return new Observable((observer) => {
			if (typeof Worker !== "undefined") {

				const worker = new Worker(new URL("../../../../../../@core/workers/reports.worker", import.meta.url));
				worker.postMessage(JSON.stringify(pdfDocument));
				worker.onmessage = ({ data }) => {

					const fileURL: any = URL.createObjectURL(data.pdfBlob);
					const a = document.createElement("a");
					a.href = fileURL;
					a.target = "_blank";
					a.download = this.reportFormTitle + ".pdf";
					document.body.appendChild(a);
					a.click();

					observer.next();
					observer.complete();
				};

				worker.onerror = (error) => {
					observer.error(error);
				};
			} else {
				// Web workers are not supported in this environment.
				// We add a fallback so that the program still executes correctly.


				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				pdfMake.createPdf(this.studentPdfDocument).download(this.getPdfTitle() + ".pdf", () => {
					observer.next();
				});
			}
		});
	}

	public generateReportFormPdfContent() {
		const optionalPdfSections: OptionalPdfSections = {
			activitiesAndValues: this.showActivitiesAndValues,
			attendanceReport: this.showAttendanceReport,
			classTeacherComments: this.showClassTeacherComments,
			classTeacherSignature: this.showClassTeacherSignature,
			competencyAreas: this.showCompetencyAreas,
			examSlot: this.showExamsSlot,
			houseTeacherComments: this.showHouseTeacherComments,
			houseTeacherSignature: this.showHouseTeacherSignature,
			principalComments: this.showPrincipalComments,
			principalSignature: this.showPrincipalSignature,
			projects: this.showProjects,
			rawScore: this.showRawScore,
			scoreDescriptor: this.showScoreDescriptor,
			subjectTeacherComments: this.showSubjectTeacherComments,
			yearSummaryReport: this.showYearSummaryReport,
			gradeDescriptor: this.showGradeDescriptor
		};
		const pdfDocContent = new ReportFormPdfDocument(this.reportForms, optionalPdfSections, this.translate);
		pdfDocContent.schoolInfo = this.schoolInfo;
		pdfDocContent.reportFormIdentifiers = this.reportFormIdentifiers;
		pdfDocContent.openingDate = this.openingDate;
		pdfDocContent.closingDate = this.closingDate;
		pdfDocContent.feeData = this.feeData;
		pdfDocContent.students = this.students;
		pdfDocContent.studentImages = this.studentImagesInBase64;
		pdfDocContent.schoolLogo = this.schoolLogoInBase64;
		pdfDocContent.signatures = this.signaturesInBase64;
		pdfDocContent.orientation = this.orientation;

		const studentPdfDocument: any = {
			info: {
				title: this.reportFormTitle,
			},
			pageOrientation: this.orientation,
			content: pdfDocContent.getReportFormPdfContent(),
			pageMargins: [5, 10, 5, 10],
			defaultStyle: {
				font: "OpenSans"
			},
			background: {}
		};

		const absolutePosition = this.orientation === "portrait" ? { x: 230, y: 340 } : { x: 340, y: 230 };
		if (this.showWatermark) {
			studentPdfDocument.background = {
				image: this.schoolLogoInBase64,
				width: 170,
				absolutePosition,
				opacity: 0.1
			};
		}

		return studentPdfDocument;
	}

	ngAfterContentChecked(): void {
		this.cdref.detectChanges();
	}

	get reportFormTitle() {
		const acadYear = "Term " + this.reportForms.term + " " + this.reportForms.year;
		if (this.reportForms.students.length > 1)
			return this.reportForms.streamName + " - " + acadYear;
		else
			return this.reportForms.students[0].studentName + " - " + acadYear;
	}

	get studentImagesInBase64() {
		const studentIds = this.reportForms.students.map(s => s.studentId);
		return this.getStudentImagesInBase64(studentIds);
	}
}
