import { AfterContentChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import * as Highcharts from "highcharts";
import { ReportForm } from "../../../@core/models/evaluation/report-form";
import { EvaluationService } from "../../../@core/services/exams/evaluations/evaluation.service";
import { HotToastService } from "@ngneat/hot-toast";
import { ExamService } from "../../../@core/services/exams/exam.service";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { OLEVEL_TERMS } from "src/app/@core/shared/utilities/olevel-terms";
import { OlevelAcademicYear, OlevelAcademicYearShort } from "src/app/@core/models/olevel/olevel-academic-year";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { OlevelTerm } from "src/app/@core/models/olevel/olevel-term";

@Component({
	selector: "app-student-olevel-profile",
	templateUrl: "./student-olevel-profile.component.html",
	styleUrls: ["./student-olevel-profile.component.scss"]
})
export class StudentOlevelProfileComponent implements OnInit, OnDestroy, AfterContentChecked {
	@Input() schoolProfile: any;
	@Input() studentId!: number;
	@Input() notesCategories: string[] | null = null;

	Highcharts: typeof Highcharts = Highcharts;
	chartOptions: Highcharts.Options = {
		title: {
			text: "",
		},
		credits: {
			enabled: false
		},
		plotOptions: {
			column: {
				colorByPoint: true,
			}
		},
		colors: [
			"#43ab49",
			"#f7a35c",
		],
		xAxis: {
			type: "category",
			title: {
				text: ""
			}
		},
		yAxis: {
			title: {
				text: ""
			},
			allowDecimals: false,
		},
		legend: {
			enabled: false
		},
		tooltip: {
			style: {
				padding: "10",
				fontWeight: "bold",
				fontSize: "14px",
			},
			pointFormat: "{point.y}",
		},
		series: [{
			dataLabels: [
				{
					enabled: true,
					format: "{point.y}",
					style: {
						color: "#00000c",
						fontSize: "15px",
						fontWeight: "bold",
						textDecoration: "none",
					},
				}
			],
			name: "",
			data: [],
			type: "column"
		}]
	};
	updateFlag = false;
	academicYears: Array<{ ayid: number, name: string }> = [];
	streams: Array<{ streamId: number, streamName: string, intakeId: number }> = [];
	selectedYear!: number;
	selectedTerm = 1;
	userRoles!: Role;
	evaluationReportForms!: ReportForm;
	evaluationSeriesExist = false;
	loading = false;
	studentDetails: BehaviorSubject<{ studentId: number, studentAdmNo: string, studentName: string, currentStream: string }> = new BehaviorSubject<{ studentId: number, studentAdmNo: string, studentName: string, currentStream: string }>({ studentId: null!, studentAdmNo: null!, studentName: "", currentStream: "" });
	studentAverage: BehaviorSubject<number> = new BehaviorSubject<number>(null!);
	schoolTypeData!: SchoolTypeData;

	readonly OLEVEL_TERMS = [...OLEVEL_TERMS];
	academicTerms: Array<OlevelTerm> = [];
	destroyed$: Subject<boolean> = new Subject<boolean>();
	currentYear?: string;
	academicYearsSub!: Subscription;
	isLoadingAcademicYears = false;
	getExamListSub?: Subscription;

	constructor(
    private rolesService: RolesService,
		private evaluationService: EvaluationService,
		private toastService: HotToastService,
		private examService: ExamService,
		private ref: ChangeDetectorRef,
		private dataService: DataService,
		private translate: TranslateService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
	) {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.loading = true;
		this.selectedTerm = this.activatedRoute.snapshot.queryParams.term ? parseInt(this.activatedRoute.snapshot.queryParams.term) : this.OLEVEL_TERMS[0].value;
		this.selectedYear = parseInt(this.activatedRoute.snapshot.queryParams.year);
		const rawYear = this.activatedRoute.snapshot.queryParams.rYear;

		this.getAcademicTerms();
		this.getCurrentYearAndAcademicYears(rawYear);
	}

	private getAcademicTerms() {
		this.academicTerms = this.OLEVEL_TERMS;
	}

	private getCurrentYearAndAcademicYears(rawYear: string) {
		this.isLoadingAcademicYears = true;

		this.academicYearsSub = this.examService.getCurrentYear()
			.pipe(
				tap((year) => this.currentYear = year.toString()),
				switchMap(() => this.getAcademicYears()),
				takeUntil(this.destroyed$)
			).subscribe(({ academicYears }) => {
				this.setAcademicYears(academicYears);
				this.isLoadingAcademicYears = false;

				this.getExamList(rawYear);
			});
	}

	private getAcademicYears() {
		return this.evaluationService.getAcademicYears();
	}

	private setAcademicYears(academicYears: OlevelAcademicYear[]) {
		this.academicYears = academicYears.map(({ academicYearId, beginYear }) => {
			return {
				ayid: academicYearId,
				name: beginYear.toString()
			};
		});

		this.setSelectedYear();
	}

	private setSelectedYear() {
		const foundAcademicYear = this.academicYears.find(({ name }) => name === this.currentYear);
		if (foundAcademicYear) this.selectedYear = foundAcademicYear.ayid;
	}

	private getExamList(rawYear: string) {
		this.getExamListSub = this.examService.getExamList().subscribe((examList) => {
			if (Object.keys(examList).length > 0)	this.academicYears = examList.academic_years;

			if (!this.selectedYear && rawYear) {
				this.selectedYear = <number>this.academicYears.find((ay) => ay.name === rawYear)?.ayid;
			}

			if (!this.selectedYear) {
				this.selectedYear = examList.ayid;
			}

			this.getReportForms();
		}, (error) => {
			this.loading = false;
			console.error(error);

			const message = this.translate.instant("students.ol-profile.toastMessages.examListError");
			this.toastService.error(message);
		});
	}

	getReportForms() {
		this.loading = true;
		this.evaluationService.getEvaluationReportFormForStudent(this.selectedYear, this.selectedTerm, this.studentId).subscribe((reportForms) => {
			this.evaluationReportForms = reportForms;
			this.evaluationSeriesExist = reportForms.evaluationSeries.length > 0;
			this.selectedTerm = reportForms.term;
			this.streams = reportForms.streams;

			this.studentDetails.next({
				studentId: reportForms.students[0]?.studentId,
				studentAdmNo: reportForms.students[0]?.studentAdmNo,
				studentName: reportForms.students[0]?.studentName,
				currentStream: reportForms.streamName
			});
			const chartData: Array<{ name: string, y: number }> = [];
			chartData.push(
				{
					name: "Days Present",
					y: reportForms.students[0]?.attendance?.presentDays
				},
				{
					name: "Days Absent",
					y: reportForms.students[0]?.attendance?.absentDays
				});
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			this.chartOptions.series[0] = {
				name: "",
				data: chartData,
				type: "column"
			};
			this.updateFlag = true;


			// console.log(reportForms
			this.loading = false;
		}, (err) => {
			this.loading = false;
			const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred2");

			this.toastService.error(err.error.response?.message || errorMsg);
		});
	}


	selectedTermUpdated(term: OlevelTerm) {
		const acadYear = this.academicYears.find((ay) => ay.ayid === this.selectedYear)?.name;
		if (!this.evaluationReportForms || this.evaluationReportForms && (acadYear != this.evaluationReportForms.year) || (this.selectedTerm && this.evaluationReportForms.term !== term.value)) {
			this.getReportForms();
		}
	}

	changeSelectedYear(year: OlevelAcademicYearShort) {
		if (!this.evaluationReportForms || this.evaluationReportForms && (year.name != this.evaluationReportForms.year) || (this.selectedTerm && this.evaluationReportForms.term !== this.selectedTerm)) {
			this.getReportForms();
		}
	}

	ngAfterContentChecked(): void {
		this.ref.detectChanges();
	}

	viewReportForm(str: { streamId: number; streamName: string; intakeId: number }) {
		if (!str) {//View report form for current student
			this.router.navigate(["/main/printouts/olevels/report-forms"],
				{
					queryParams: {
						student: this.studentId,
						acadYear: this.selectedYear,
						term: this.selectedTerm,
					}
				});
		} else {
			this.router.navigate(["/main/printouts/olevels/report-forms"],
				{
					queryParams: {
						acadYear: this.selectedYear,
						term: this.selectedTerm,
						stream: str.streamId,
					}
				});
		}
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.unsubscribe();
		this.getExamListSub?.unsubscribe();
	}
}
