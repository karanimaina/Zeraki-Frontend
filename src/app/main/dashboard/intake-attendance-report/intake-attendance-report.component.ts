import { Component, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import {Sort} from "@angular/material/sort";
import {BasicUtils} from "../../../@core/shared/utilities/basic.utils";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "../../../@core/shared/services/data/data.service";
import {HotToastService} from "@ngneat/hot-toast";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-intake-attendance-report",
	templateUrl: "./intake-attendance-report.component.html",
	styleUrls: ["./intake-attendance-report.component.scss"]
})
export class IntakeAttendanceReportComponent implements OnInit {
	schoolTypeData!: SchoolTypeData;
	Highcharts: typeof Highcharts = Highcharts;
	streamsChartOptions: Highcharts.Options = {
		title: {
			text: "",
		},
		credits: {
			enabled: false
		},
		colors: ["#43AB49"],
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
			name: "",
			data: [],
			type: "column"
		}]
	};
	currentClass!: number;
	students: Array<{
		userId: number,
		admNo: number,
		studentName: string,
		presentDays: number,
		absentDays: number,
		presentPercentage: number,
		streamId?: number,
		streamName?: string,
	}> = [];
	updateLevelFlag = false;
	selectedFilterBy = 1;

	admNoTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.admno");
	nameTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.name");
	streamTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.stream");
	daysPresentTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.daysPresent");
	daysAbsentTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.daysAbsent");
	totalDaysTableHeader = this.translate.instant("dashboard.intakeAttendaceReport.tableHeaders.totalDays");
	studentNameText = this.translate.instant("dashboard.intakeAttendaceReport.studentName");

	filterByOptions: any[] = [
		{
			name: this.admNoTableHeader,
			value: 1
		},
		{
			name: this.nameTableHeader,
			value: 2
		},
		{
			name: this.streamTableHeader,
			value: 3
		}
	];
	selectedStream: any;
	searchText: string | number = "";
	sortedStudents: Array<{
		userId: number,
		admNo: number,
		studentName: string,
		presentDays: number,
		absentDays: number,
		presentPercentage: number,
		streamId?: number
		streamName?: string
	}>;
	streams: Array<{ streamName: string, streamId: number }> = [];
	intakeId!: number;
	loading = false;
	selectedTerm!: number;
	selectedYear!: number;

	constructor(private activatedRoute: ActivatedRoute,
		private classesService: ClassesService,
		private dataService: DataService,
		private translate: TranslateService,
		private toastService: HotToastService) {
		this.sortedStudents = this.students.slice();
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.intakeId = this.activatedRoute.snapshot.params.id;
		this.selectedYear = this.activatedRoute.snapshot.queryParams.year;
		this.selectedTerm = this.activatedRoute.snapshot.queryParams.term;
		if (this.intakeId) {
			this.getIntakeAttendanceReport();
		}
	}

	private getIntakeAttendanceReport() {
		this.loading = true;
		this.classesService.getIntakeAttendanceReport(this.intakeId, this.selectedYear, this.selectedTerm).subscribe(
			(res) => {
				this.loading = false;
				this.currentClass = res.form;

				this.streams = res.streams.map(str => {
					return {
						streamName: str.streamName,
						streamId: str.streamId
					};
				});

				const streams = res.streams.map(s => {
					return {
						name: res.form + " " + s.streamName,
						y: s.streamAttendancePercentage
					};
				});
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				this.streamsChartOptions?.series[0] = {
					dataLabels: [
						{
							enabled: true,
							format: "{point.y} %",
							style: {
								color: "#00000c",
								fontSize: "15px",
								fontWeight: "bold",
							},
						}
					],
					name: "",
					data: streams,
					type: "column"
				};
				this.updateLevelFlag = true;

				res.streams.forEach(s => {
					const students = s.students.map(st => {
						return {
							userId: st.userId,
							admNo: st.admNo,
							studentName: st.studentName,
							presentDays: st.presentDays,
							absentDays: st.absentDays,
							presentPercentage: st.presentPercentage,
							streamId: s.streamId,
							streamName: s.streamName
						};
					});
					this.students = this.students.concat(students);
				});
				this.sortedStudents = this.students.slice();
			},
			(err: any) => {
				this.loading = false;
				const msg = this.translate.instant("dashboard.intakeAttendaceReport.toastMessages.error", { reason: err.error.response.message });
				this.toastService.error(msg);
			}
		);
	}

	sortData(sort: Sort) {
		const data = this.sortedStudents.slice();
		if (!sort.active || sort.direction === "") {
			this.sortedStudents = data;
			return;
		}

		this.sortedStudents = data.sort((a: any, b: any) => {
			const isAsc = sort.direction === "asc";
			switch (sort.active) {
				case this.admNoTableHeader: return BasicUtils.compare(parseInt(a.admNo), parseInt(b.admNo), isAsc);
				case this.nameTableHeader: return BasicUtils.compare(a.studentName, b.studentName, isAsc);
				case this.streamTableHeader: return BasicUtils.compare(a.streamName, b.streamName, isAsc);
				case this.daysPresentTableHeader: return BasicUtils.compare(a.presentDays, b.presentDays, isAsc);
				case this.daysAbsentTableHeader: return BasicUtils.compare(a.absentDays, b.absentDays, isAsc);
				// case 'Tot': return BasicUtils.compare((a.kcpe || 0),(b.kcpe || 0), isAsc);
				default: return 0;
			}
		});
	}

	updateFilterByOption($event: Event, filterOption: number) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			this.selectedFilterBy = filterOption;
		} else {
			this.selectedFilterBy = 1;
		}
		this.searchText = "";
		this.selectedStream = null!;
		this.sortedStudents = this.students.slice();
	}

	filterByAdmOrName($event: Event) {
		console.log($event);
		if (this.selectedFilterBy === 1) {//Search by admno
			this.sortedStudents = this.students.filter(student => {
				return student.admNo.toString().toLowerCase().includes(this.searchText.toString().toLowerCase());
			});
		} else {
			this.sortedStudents = this.students.filter(student => {
				return student.studentName.toString().toLowerCase().includes(this.searchText.toString().toLowerCase());
			});
		}
	}

	filterByStream($event: any) {
		if (!this.selectedStream) {
			this.sortedStudents = this.students.slice();
		} else {
			this.sortedStudents = this.students.filter(student => {
				return student.streamId === this.selectedStream;
			});
		}
	}
}
