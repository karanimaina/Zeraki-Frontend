import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import * as Highcharts from "highcharts";
import { Options } from "highcharts";
import { StudentReport } from "../../../../../@core/models/printouts/report-forms/student-report";
import { SchoolTypeData } from "../../../../../@core/models/school-type-data";

@Component({
	selector: "app-student-rank",
	templateUrl: "./student-rank.component.html",
	styleUrls: ["./student-rank.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentRankComponent implements OnInit {

	@Input() studentReport!: StudentReport;
	@Input() schoolTypeData!: SchoolTypeData;
	@Input() showStudentOverallRank!: boolean;
	@Input() showStudentStreamRank!: boolean;
	@Input() showGPA?: boolean;

	@Output() studentProfileLoaded: EventEmitter<number> = new EventEmitter<number>();

	Highcharts: typeof Highcharts = Highcharts;
	subjectComparisonChart!: Options;

	constructor() { }

	ngOnInit(): void {
		const subjectLabels = this.studentReport.studentVsClassSubjectComparison.studentSubjectPerformance.map(subject => subject.name);
		const studentSubjectPerformance = this.studentReport.studentVsClassSubjectComparison.studentSubjectPerformance.map(subject => subject.value);
		const classSubjectPerformance = this.studentReport.studentVsClassSubjectComparison.classSubjectPerformance.map(subject => subject.value);

		this.subjectComparisonChart = {
			credits: { enabled: false },
			chart: {
				height: 250,
			},
			title: {
				text: ""
			},
			legend: {
				layout: "horizontal",
				align: "right",
				verticalAlign: "top",
				floating: true,
			},
			yAxis: {
				labels: { y: 5, x: -2 },
				max: this.studentReport.studentVsClassSubjectComparison.max,
				min: this.studentReport.studentVsClassSubjectComparison.min,
				title: { text: "", align: "high" },
				gridLineColor: "rgba(228, 229, 231, 0.60)"
			},
			xAxis: {
				type: "category",
				categories: subjectLabels,
				tickmarkPlacement: "on",
				gridLineWidth: 1,
				gridLineColor: "rgba(228, 229, 231, 0.60)",
				labels: {
					style: { textOverflow: "none" }
				}
			},
			series: [{
				name: this.studentReport.studentVsClassSubjectComparison.studentName,
				pointPlacement: "on",
				data: studentSubjectPerformance,
				type: "line",
				showInLegend: true,
				color: "#43ab49",
				zIndex: 2
			}, {
				name: this.studentReport.studentVsClassSubjectComparison.className,
				pointPlacement: "on",
				data: classSubjectPerformance,
				type: "area",
				showInLegend: true,
				color: {
					linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
					stops: [
						[0, "#C0C0C0"],
					]
				},
				zIndex: 1
			}],
			exporting: {
				enabled: false
			}
		};
	}

	changeImageSrc($event) {
		$event.target.src = "assets/img/avatar/p_avatar_blue.png";
	}

	imageLoaded() {
		this.studentProfileLoaded.emit(this.studentReport.userId);
	}

	get showMajor(): boolean {
		return (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool);
	}
}
