import { Component, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { ExamService } from "../../../@core/services/exams/exam.service";
import { HotToastService } from "@ngneat/hot-toast";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { Router } from "@angular/router";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-attendance-report",
	templateUrl: "./attendance-report.component.html",
	styleUrls: ["./attendance-report.component.scss"]
})
export class AttendanceReportComponent implements OnInit {
	private category1: string = this.translate.instant("dashboard.attendanceReport.charts.category1");
	private category2: string = this.translate.instant("dashboard.attendanceReport.charts.category2");
	private category3: string = this.translate.instant("dashboard.attendanceReport.charts.category3");
	private category4: string = this.translate.instant("dashboard.attendanceReport.charts.category4");

	Highcharts: typeof Highcharts = Highcharts;
	chartOptions: Highcharts.Options = {
		title: {
			text: "",
		},
		credits: {
			enabled: false
		},
		xAxis: {
			type: "category",
			categories: [this.category1, this.category2, this.category3, this.category4],
			title: {
				text: ""
			}
		},
		colors: ["#43AB49"],
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
			dataLabels:[
				{
					enabled: true,
					format: "{point.y} %",
					style: {
						color: "#00000c",
						fontSize: "15px",
						fontWeight: "bold",
						textDecoration: "none",
					},
				}
			],
			name: "",
			cursor: "pointer",
			data: [],
			type: "column",
			point: {
				events: {
					click: function () {
						// alert('Category: ' + this.category + ', value: ' + this.y);
					}
				}
			}
		}]
	};

	updateFlag = false;
	intakes: Array<{intakeId: number, form: number}> = [];
	academicYears: Array<{year: number, term: number, label: string}> = [];
	selectedAcadYear!: {year: number, term: number, label: string};
	schoolTypeData!: SchoolTypeData;
	loading = false;

	constructor(private classesService: ClassesService,
              private toastService: HotToastService,
              private translate: TranslateService,
              private dataService: DataService,
              private router: Router) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		this.chartOptions.series[0].point.events.click =  ({point}) =>{
			this.navigateToStreamsAttendance(point.category);
		};

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.getSchoolAttendanceReport();
	}

	private navigateToStreamsAttendance(category) {
		const form = category.split(" ")[1];
		const intakeId = this.intakes.find(intake => intake.form === parseInt(form))?.intakeId;
		this.router.navigate([`/main/dashboard/welcome/attendance-report/${intakeId}`],
			{queryParams: {year: this.selectedAcadYear.year, term: this.selectedAcadYear.term}});
	}

	selectedAcadYearUpdated() {
		console.log(this.selectedAcadYear);
		if (this.selectedAcadYear){
			this.getSchoolAttendanceReport();
		}
	}
	private getSchoolAttendanceReport() {
		this.loading = true;
		const {term, year} = this.selectedAcadYear ? this.selectedAcadYear : {term: null, year: null};

		this.classesService.getSchoolAttendanceReport(term!, year!).subscribe({
			next: (res) => {
				this.loading = false;
				this.academicYears = res.termOptions.termYears;
				this.selectedAcadYear = this.academicYears.find(ac => ac.year == res.termOptions.currentYear && ac.term == res.termOptions.currentTerm)!;
				console.log(this.selectedAcadYear);
				this.intakes = res.intakes.map(intake => ({
					intakeId: intake.intakeId,
					form: intake.form
				}));
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				this.chartOptions.series[0].data = res.intakes.map(i => {
					return {
						name:( this.schoolTypeData ? this.schoolTypeData.formoryear : "" )+ " " + i.form,
						y: i.intakeAttendancePercentage
					};
				});
				this.updateFlag = true;
			},
			error: (err) => {
				this.loading = false;
				const msg = this.translate.instant("dashboard.attendanceReport.toastMessages.error", { reason: err.error.response.message });
				this.toastService.error(msg);
			}
		});
	}
}
