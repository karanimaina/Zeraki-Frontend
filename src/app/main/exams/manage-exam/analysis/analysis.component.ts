import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { saveAs } from "file-saver";
import * as Highcharts from "highcharts";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { Sort } from "@angular/material/sort";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { analysisExamGuinea } from "src/app/@core/constants/analysisExamGuinea";
import { Major } from "src/app/@core/models/major/major";
import { Subject } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamItems } from "src/app/@core/models/exams/exam-dropdown-items";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { takeUntil } from "rxjs/operators";
import { SchoolTypes } from "src/app/@core/enums/school-types";

@Component({
	selector: "app-analysis",
	templateUrl: "./analysis.component.html",
	styleUrls: ["./analysis.component.scss"]
})
export class AnalysisComponent implements OnInit, OnDestroy {
	schoolTypeData?: SchoolTypeData;
	schoolTypes = SchoolTypes;
	destroy$: Subject<boolean> = new Subject<boolean>();

	fetching_examsData_inprogress = true;
	show_data = false;
	selected_kcse_mean: any = {};
	show_top_students: any = {};
	print_options: any = {};
	sorthouses = { type: "overall", reverse: true };
	sortdata: any = {};
	sortdata_print: any = {};
	fetchDataCount = 0;
	showReport = false;

	majors: Major[] = [];
	selected_exam: any = "";
	selected_major: any = "";
	isMobileApp = false;

	isHighcharts = typeof Highcharts === "object";

	Highcharts: typeof Highcharts = Highcharts;
	chartOptions: Highcharts.Options =
		{
			chart: {
				width: 490
			},
			title: {
				text: ""
			},
			legend: { enabled: false },
			yAxis: {
				lineWidth: 1,
				title: {
					text: ""
				}
			},
			xAxis: {
				// categories: ['1 North', '1 E'],
				categories: []
			},
			series: [
				{
					// data: [["1 North",7.6596], ["1 E",3]],
					data: [],
					type: "area",
					pointPlacement: "on",
					name: "Stream  Mean",
					color: {
						linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
						stops: [
							[0, "#43ab49"], // start
							// [0.5, '#3366AA'], // middle
							[1, "#ffffff"] // end
						]
					}
				}
			],
		};

	HighchartStreams: typeof Highcharts = Highcharts;
	highchart_stream_comparison: Highcharts.Options = {
		chart: {
			height: 190
		},
		title: { text: "" },
		credits: {
			enabled: false
		},
		xAxis: {
			type: "category",
			tickmarkPlacement: "on",
			gridLineWidth: 1,
			gridLineColor: "rgba(228, 229, 231, 0.60)",
			labels: {
				style: { textOverflow: "none" },
				autoRotation: [-45, -90]
			}
		},
		yAxis: {
			labels: { y: 5, x: -2 },
			title: { text: "", align: "high" },
			min: 0,
			max: 12,
			gridLineColor: "rgba(228, 229, 231, 0.60)"
		},
		series: [{
			name: "Stream  Mean",
			pointPlacement: "on",
			data: [],
			type: "area",
			showInLegend: false,
			color: "rgba(98, 203, 49, 0.35)",
			fillOpacity: 0.35
		}],
		exporting: {
			enabled: false
		}
	};

	HighchartTimeSeries: typeof Highcharts = Highcharts;
	isHichartTimeSeriesUpdateFlag = false;
	highchart_time_series: Highcharts.Options = {
		title: { text: "" },
		credits: {
			enabled: false
		},
		xAxis: {
			type: "category",
			tickmarkPlacement: "on",
			gridLineColor: "rgba(228, 229, 231, 0.60)",
			labels: {
				style: { textOverflow: "none" },
				autoRotation: [-45, -90]
			}
		},
		yAxis: {
			title: {
				text: "",
				align: "high"
			},
			min: 0,
			max: 12//gridLineColor: 'rgba(228, 229, 231, 0.60)'
		},
		legend: {
			layout: "vertical",
			align: "right",
			verticalAlign: "middle"
		},
		plotOptions: {
			series: {
				label: {
					connectorAllowed: false
				},
				// pointStart: 2010
			}
		},
		series: [],
		chart: {
			height: 400
		},
		responsive: {
			rules: [{
				// condition: {
				//     maxWidth: 600
				// },
				chartOptions: {
					legend: {
						layout: "horizontal",
						align: "center",
						verticalAlign: "bottom"
					}
				}
			}]
		}
	};

	HighchartSubjectMean: typeof Highcharts = Highcharts;
	highchart_subject_mean: Highcharts.Options = {
		chart: {
			type: "column",
			height: 400
		},
		scrollbar: { enabled: true },
		title: { text: "" },
		xAxis: {
			type: "category",
			tickmarkPlacement: "on",
			gridLineColor: "rgba(228, 229, 231, 0.60)",
			labels: {
				style: { textOverflow: "none" },
				autoRotation: [-45, -90]
			},
			categories: []
		},
		yAxis: {
			title: { text: "Mean" }
		},
		series: [],
		exporting: {
			enabled: false
		}
	};

	HighchartSubjectPerGrade: typeof Highcharts = Highcharts;
	highchart_students_per_grade: Highcharts.Options = {
		chart: {
			type: "column",
			height: 400
		},
		scrollbar: { enabled: true },
		title: { text: "" },
		xAxis: {
			type: "category",
			tickmarkPlacement: "on",
			gridLineColor: "rgba(228, 229, 231, 0.60)",
			labels: {
				style: { textOverflow: "none" },
				autoRotation: [-45, -90]
			},
			categories: []
		},
		yAxis: {
			title: { text: "Number of Students" }
		},
		series: [],
		exporting: {
			enabled: false
		}
	};

	pathParams: any;
	classData: any = {};
	selectedStream: any = {};
	timeseries_examseries: any[] = [];
	timeseries_examseries_min: any;
	timeseries_examseries_max: any;
	timeseries_examgroup: any[] = [];
	timeseries_annualexamgroup: any[] = [];
	timeseries_examgroup_min: any;
	timeseries_examgroup_max: any;
	kcse_mean_time_series_exists = false;
	timeSeriesExamSeries_kcse: any[] = [];
	timeSeriesExamSeries_kcse_min!: number;
	timeSeriesExamSeries_kcse_max!: number;
	yAxis: any = {};
	streams: any;
	exams: any;
	grade_breakdown: any = {};
	selected_stream: any;
	school_profile: any = {};
	isLoadingData = true;
	loadingDataFailed = false;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	timeseries_annualexamgroup_min: any;
	timeseries_annualexamgroup_max: any;

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private rolesService: RolesService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.initAnalysis();
		this.loadSchoolProfile();
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	initAnalysis() {
		this.selected_kcse_mean.item = null;
		this.show_top_students.subjects = false;
		this.show_top_students.only = false;
		this.show_top_students.hide_all = false;
		this.print_options.one_subject_per_page = false;
		this.sortdata.type = "code";
		this.sortdata.reverse = false;
		this.sortdata_print.type = "value";
		this.sortdata_print.reverse = true;
		this.isMobileApp = this.dataService.getIsMobileApp();
		this.pathParams = this.activatedRoute.snapshot.params;
	}

	loadSchoolProfile() {
		// this.schoolService.schoolInfo.subscribe((schoolInfo => {
		// 	this.school_profile = schoolInfo;
		// }));
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe(
			(res: any) => {
				this.schoolTypeData = res;
				if (this.schoolTypeData) this.fetchContent();
			}
		);
	}

	onTopStudentsHideAllChange() {
		if (this.show_top_students.hide_all)
			this.show_top_students.only = false;
		else
			this.show_top_students.subjects = true;
	}

	onTopStudentsSubjectsChange() {
		if (!this.show_top_students.subjects)
			this.show_top_students.only = false;
	}

	onTopStudentsOnlyChange() {
		if (this.show_top_students.only) {
			this.show_top_students.subjects = true;
			this.show_top_students.hide_all = false;
		}
	}

	viewSubjectPerformance(s: any) {

		if (+this.pathParams.annual_egroup_id > 0) this.selected_exam.annualEgroupId = +this.pathParams.annual_egroup_id;
		let seriesid = 0;
		let egroupid = 0;
		let subjectid = 0;
		let intakeid = 0;
		let classid = 0;
		let annualEgroupId = 0;
		if (this.selected_stream.streamid && this.selected_stream.streamid > 0) {
			classid = s.classid;
		} else if (this.selected_stream.intakeid && this.selected_stream.intakeid > 0) {
			intakeid = this.selected_stream.intakeid;
			subjectid = s.subjectid;
		}

		if (this.selected_exam.seriesid && this.selected_exam.seriesid > 0) {
			seriesid = this.selected_exam.seriesid;
		} else if (this.selected_exam.egroupid && this.selected_exam.egroupid > 0) {
			egroupid = this.selected_exam.egroupid;
		}
		let major = -1;
		const setSelectedMajor = this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
		if (setSelectedMajor) {
			major = this.selected_major;
		}

		if (this.pathParams.annual_egroup_id) {
			annualEgroupId = this.pathParams.annual_egroup_id;
			egroupid = -1;
		}
		// return;
		// if(annualEgroupId <= 0) {
		this.router.navigate([
			"/main/exams/manage/analysis/subject",
			seriesid,
			egroupid,
			subjectid,
			intakeid,
			classid,
			-1,
			major,
			annualEgroupId
		]);
		// }
	}

	viewReportForm(stream: any) {
		let streamid = 0;
		let seriesid = 0;
		let egroupid = 0;
		if (stream && stream.streamid && stream.streamid > 0) {
			streamid = stream.streamid;
		}

		if (this.selected_exam.seriesid && this.selected_exam.seriesid > 0) {
			seriesid = this.selected_exam.seriesid;
		} else if (this.selected_exam.egroupid && this.selected_exam.egroupid > 0) {
			egroupid = this.selected_exam.egroupid;
		}

		// $state.go("home.printouts.studentreport.form.r", {
		//     streamid: streamid,
		//     seriesid: seriesid,
		//     egroupid: egroupid
		// });

		// console.warn(" >> ", streamid, seriesid, egroupid, this.classData);
		// this.router.navigate(['/main/printouts/rform', -1, streamid, seriesid, egroupid, this.classData.intakeid]);
		let reportFormRoute = "/main/printouts/rform";

		if (this.schoolTypeData?.isTanzaniaPrimary || this.schoolTypeData?.isTanzaniaSecondary) {
			reportFormRoute = "/main/printouts/tz-rform";
		}

		this.router.navigate([
			reportFormRoute,
			-1,
			streamid,
			seriesid,
			egroupid,
			-1,
		]);
	}

	getReportParams() {
		let seriesid = 0;
		let egroupid = 0;
		let intakeid = 0;
		let streamid = 0;
		if (this.selected_stream.streamid && this.selected_stream.streamid > 0) {
			streamid = this.selected_stream.streamid;
		} else if (this.selected_stream.intakeid != undefined && this.selected_stream.intakeid != null && this.selected_stream.intakeid > 0) {
			intakeid = this.selected_stream.intakeid;
		}

		if (this.selected_exam.seriesid != undefined && this.selected_exam.seriesid != null && this.selected_exam.seriesid > 0) {
			seriesid = this.selected_exam.seriesid;
		} else if (this.selected_exam.egroupid != undefined && this.selected_exam.egroupid != null && this.selected_exam.egroupid > 0) {
			egroupid = this.selected_exam.egroupid;
		}
		const params = {
			seriesid: seriesid,
			egroupid: egroupid,
			intakeid: intakeid,
			streamid: streamid,
		};
		return params;
	}

	viewMeritList(show_most_improved = false) {
		const params: any = this.getReportParams();
		let most_improved: any;
		if (show_most_improved) {
			most_improved = 1;
		}
		params.most_improved = most_improved;
		this.router.navigate(["/main/printouts/mlist"], { queryParams: params });
	}

	onKcseMeanChange() {
		this.classData.subjects.list.forEach((sb) => {
			let previous_mean: any = null;
			if (this.selected_kcse_mean.item != null && this.selected_kcse_mean.item != undefined) {
				previous_mean = this.selected_kcse_mean.item[sb.text_code];
			}

			if (previous_mean == null || previous_mean == undefined) {
				previous_mean = 0.0;
			}
			if (previous_mean == null || previous_mean == undefined || this.selected_kcse_mean.item == null || this.selected_kcse_mean.item == undefined) {
				sb.kcse_mean_change = 0;
			} else {
				sb.kcse_mean_change = sb.value - previous_mean;
				sb.previous = parseFloat(previous_mean.toFixed(4));
				if (previous_mean == 0) {
					sb.kcse_mean_change = 0;
					sb.previous = 0;
				}

				if (this.classData && this.classData.subjects) {
					this.classData.subjects.show_previous = true;
				}
			}
		});
		const handle_overall_mean = true;
		if (handle_overall_mean) {
			let previous_mean: any = null;
			if (this.selected_kcse_mean.item != null && this.selected_kcse_mean.item != undefined) {
				previous_mean = this.selected_kcse_mean.item["OVERALL"];
			}
			if (previous_mean == null || previous_mean == undefined) {
				previous_mean = 0.0;
				this.classData.kcse_mean_change = 0;
			}
			if (previous_mean == null || previous_mean == undefined || this.selected_kcse_mean.item == null || this.selected_kcse_mean.item == undefined) {
				this.classData.kcse_mean_change = 0;
			} else {
				this.classData.aggregate_stats.second = {};
				if (previous_mean > 0) {
					this.classData.kcse_mean_change = this.classData.aggregate_stats.first.value - previous_mean;
					this.classData.aggregate_stats.second.name = "Previous Points";
					this.classData.aggregate_stats.second.value = parseFloat(previous_mean.toFixed(4));
					this.classData.aggregate_stats.second.change = "(KCSE " + this.selected_kcse_mean.item["year"] + ")";
				}
			}
		}
	}

	mostImproved() {
		this.viewMeritList(true);
	}

	getBarColor(marks: any) {
		return this.dataService.getColorScheme(marks);
	}

	streamsPerformances: any[] = [];
	guinea_graphData: any = null;
	// graphSetup
	loadData() {
		this.selected_kcse_mean.item = null;
		this.streams = this.classData.streams;
		this.exams = this.classData.exams;
		this.streams?.forEach((stream: any, i: number) => {
			if (this.classData.current_streamintake_value == stream.value) {
				this.selected_stream = this.streams[i];
			}
		});
		this.exams?.forEach((exam: any, i: number) => {
			if (this.classData.examid == exam.examid && this.classData.examtype == exam.type) {
				this.selected_exam = this.exams[i];
			}
		});
		if (this.classData.merit_summary_list && this.classData.merit_summary_list.length > 0) {
			this.grade_breakdown = {};
			this.grade_breakdown.current_item = this.classData.merit_summary_list[0];
		}

		if (this.classData.stream_comparison) {
			this.streamsPerformances = [];
			let majorLabel: any = [];
			let graphObject: any = [];
			this.classData.stream_comparison.list.forEach((sc: any) => {

				this.streamsPerformances.push({
					name: sc.stream_name,
					value: sc.value,
					y: sc.value,
					majors: sc.majors,
				});
				/**This section only happens for guinea schools. */
				if (sc.majors) {
					majorLabel.push(sc.stream_name);
					sc.majors.forEach((major: any) => {

						graphObject.push({
							type: "column",
							name: major.major,
							data: []
						});
					});
					sc.majors.forEach((major: any, index: number) => {
						const graphObj = graphObject[index];
						graphObj.type = "column";
						graphObj.name = major.major;
						graphObj.data = [...graphObj.data, ...[major.value]];

					});
				}
			});

			this.guinea_graphData = {
				labels: majorLabel,
				graphData: graphObject,
				min: this.classData.stream_comparison.min,
				max: this.classData.stream_comparison.max,
			};

			majorLabel = [];
			graphObject = [];

			// console.log(this.guinea_graphData);

			this.highchart_stream_comparison = {
				chart: {
					height: 190
				},
				title: { text: "" },
				xAxis: {
					type: "category",
					tickmarkPlacement: "on",
					gridLineWidth: 1,
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: { textOverflow: "none" },
						autoRotation: [-45, -90]
					}
				},
				yAxis: {
					labels: { y: 5, x: -2 },
					title: { text: "", align: "high" },
					min: this.classData.stream_comparison.min,
					max: this.classData.stream_comparison.max,
					gridLineColor: "rgba(228, 229, 231, 0.60)"
				},
				series: [
					{
						name: "Stream  Mean",
						pointPlacement: "on",
						data: this.streamsPerformances,
						type: "area",
						showInLegend: false,
						color: "rgba(98, 203, 49, 0.35)",
						fillOpacity: 0.35,
					},
				],
				credits: {
					enabled: false
				},
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.subjects) {
			const categories_subject: any[] = [];
			const data_subject: any[] = [];
			this.classData.subjects.list.forEach((s) => {
				categories_subject.push(s.text_code);
				data_subject.push(s.value);
			});

			this.highchart_subject_mean = {
				chart: {
					type: "column",
					height: 400
				},
				scrollbar: { enabled: true },
				title: { text: "" },
				xAxis: {
					type: "category",
					tickmarkPlacement: "on",
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: { textOverflow: "none" },
						autoRotation: [-45, -90]
					},
					categories: categories_subject
				},
				yAxis: {
					title: { text: this.classData.subjects.value_type }
				},
				series: [{
					type: "column",
					name: this.classData.subjects.value_type,
					data: data_subject,
					showInLegend: false
				}],
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.current_class_grade_count_summary && this.classData.current_class_grade_count_summary.length > 0) {
			const categories_grades: any[] = [];
			const data_grades: any[] = [];
			this.classData.current_class_grade_count_summary.forEach((g) => {
				categories_grades.push(g.grade);
				data_grades.push(g.count);
			});

			this.highchart_students_per_grade = {
				chart: {
					height: 400
				},
				scrollbar: { enabled: true },
				title: { text: "" },
				xAxis: {
					type: "category",
					tickmarkPlacement: "on",
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: { textOverflow: "none" },
						autoRotation: [-45, -90]
					},
					categories: categories_grades
				},
				yAxis: {
					title: { text: "Number of Students" }
				},
				series: [{
					type: "column",
					name: "Number of Students",
					data: data_grades,
					showInLegend: false
				}],
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.timeseries) {
			if (this.classData.timeseries.examseries) {
				this.timeseries_examseries = [];
				this.timeseries_examseries_min = this.classData.timeseries.examseries.min;
				this.timeseries_examseries_max = this.classData.timeseries.examseries.max;
				this.classData.timeseries.examseries.list.forEach(stream => {
					stream.data.forEach(sd => {
						if (sd.value == undefined || sd.value == null || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_examseries.push({
						type: "line",
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						marker: { symbol: "circle" },
						data: stream.data,
					});
				});
			}

			if (this.classData.timeseries.examgroup) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.classData.timeseries.examgroup.min;
				this.timeseries_examgroup_max = this.classData.timeseries.examgroup.max;
				this.classData.timeseries.examgroup.list.forEach((stream) => {
					stream.data.forEach((sd) => {
						if (!sd.value || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_examgroup.push({
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						marker: { symbol: "circle" },
						data: stream.data,
					});
				});
			}

			if (this.classData.timeseries.annualEgroup) {
				this.timeseries_annualexamgroup = [];
				this.timeseries_annualexamgroup_min = this.classData.timeseries.annualEgroup.min;
				this.timeseries_annualexamgroup_max = this.classData.timeseries.annualEgroup.max;

				this.classData.timeseries.annualEgroup.list.forEach((stream) => {
					stream.data.forEach((sd: any) => {
						if (!sd.value || sd.value == null || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_annualexamgroup.push({
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						marker: { symbol: "circle" },
						data: stream.data,
					});
				});
			}

			const handle_kcse_mean_time_series = true;
			this.kcse_mean_time_series_exists = false;
			if (handle_kcse_mean_time_series) {
				this.timeSeriesExamSeries_kcse = [];
				this.timeSeriesExamSeries_kcse_min = 12;
				this.timeSeriesExamSeries_kcse_max = 0;
				if (this.classData.kcse_means_previous && this.classData.kcse_compare) {
					const kcse_mean_time_series_data: any[] = [];
					this.classData.kcse_means_previous.forEach((km) => {
						const kcse_title = "KCSE " + km.year;
						const kcse_mean = km.OVERALL;
						const single_km_data: any = {};
						single_km_data.name = kcse_title;
						single_km_data.y = kcse_mean;
						kcse_mean_time_series_data.push(single_km_data);
						if (kcse_mean < this.timeSeriesExamSeries_kcse_min) {
							this.timeSeriesExamSeries_kcse_min = kcse_mean;
						}
						if (kcse_mean > this.timeSeriesExamSeries_kcse_max) {
							this.timeSeriesExamSeries_kcse_max = kcse_mean;
						}
					});
					const add_current_kcse = true;
					if (add_current_kcse) {
						const kcse_title = "KCSE " + this.classData.exam_year;
						const kcse_mean = this.classData.aggregate_stats.first.value;
						const single_km_data: any = {};
						single_km_data.name = kcse_title;
						single_km_data.y = kcse_mean;
						kcse_mean_time_series_data.push(single_km_data);
						if (kcse_mean < this.timeSeriesExamSeries_kcse_min) {
							this.timeSeriesExamSeries_kcse_min = kcse_mean;
						}
						if (kcse_mean > this.timeSeriesExamSeries_kcse_max) {
							this.timeSeriesExamSeries_kcse_max = kcse_mean;
						}
					}
					if (kcse_mean_time_series_data.length > 0) {
						this.kcse_mean_time_series_exists = true;
						this.timeSeriesExamSeries_kcse_max += 1.5;
						this.timeSeriesExamSeries_kcse_min -= 1.5;
						if (this.timeSeriesExamSeries_kcse_max > 12) {
							this.timeSeriesExamSeries_kcse_max = 12;
						}
						if (this.timeSeriesExamSeries_kcse_min < 0) {
							this.timeSeriesExamSeries_kcse_min = 0;
						}

						this.timeSeriesExamSeries_kcse.push({
							name: "KCSE",
							colorByPoint: false,
							cursor: "pointer",
							type: "line",
							marker: {
								symbol: "circle"
							},
							data: kcse_mean_time_series_data
						});
					}

					if (this.classData.kcse_means_previous.length >= 1) {
						const previous_index = (this.classData.kcse_means_previous.length - 1);
						this.selected_kcse_mean.item = this.classData.kcse_means_previous[previous_index];
						this.onKcseMeanChange();
					}
				}

				this.show_top_students.hide_all = false;
				if (this.classData.kcse_means_previous) {
					this.show_top_students.hide_all = true;
				}
			}

			if (this.classData.kcse_compare && this.kcse_mean_time_series_exists) {
				this.highchart_time_series = {
					title: { text: "" },
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {
							text: "",
							align: "high"
						},
						min: this.timeSeriesExamSeries_kcse_min,
						max: this.timeSeriesExamSeries_kcse_max
					},
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
							// pointStart: 2010
						}
					},
					series: this.timeSeriesExamSeries_kcse,
					chart: {
						height: 400
					}
				};
			} else if (this.classData.examtype == 1) {
				this.highchart_time_series = {
					title: { text: "" },
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {
							text: "",
							align: "high"
						},
						min: this.timeseries_examseries_min,
						max: this.timeseries_examseries_max
					},
					// legend: {
					//   layout: 'vertical',
					//   align: 'right',
					//   verticalAlign: 'middle'
					// },
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
							// pointStart: 2010
						}
					},
					series: this.timeseries_examseries,
					chart: {
						height: 400
					}
				};
			} else if (this.classData.examtype == 2) {
				this.highchart_time_series = {
					title: { text: "" },
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {
							text: "",
							align: "high"
						},
						min: this.timeseries_examgroup_min,
						max: this.timeseries_examgroup_max
					},
					// legend: {
					//   layout: 'vertical',
					//   align: 'right',
					//   verticalAlign: 'middle'
					// },
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
							// pointStart: 2010
						}
					},
					series: this.timeseries_examgroup,
					chart: {
						height: 400
					}
				};
			} else if (this.classData.examtype == 3) {
				this.highchart_time_series = {
					title: { text: "" },
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {
							text: "",
							align: "high"
						},
						min: this.timeseries_annualexamgroup_min,
						max: this.timeseries_annualexamgroup_max
					},
					// legend: {
					//   layout: 'vertical',
					//   align: 'right',
					//   verticalAlign: 'middle'
					// },
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
							// pointStart: 2010
						}
					},
					series: this.timeseries_annualexamgroup,
					chart: {
						height: 400
					}
				};
			}
		}
		// if (fetchDataCount > 0) {
		//     this.reAnimateViews();
		// }
		this.fetchDataCount++;
		this.show_data = true;
	}

	change_selected_stream(selected_stream?: any) {
		if (selected_stream) this.selected_stream = selected_stream;
		this.showReport = false;
		this.fetchContent();
	}

	changeSelectedExam(selectedExam?: any) {
		if (selectedExam) this.selected_exam = selectedExam;
		this.showReport = false;
		this.fetchContent();
	}

	compareExamsFunction(item: ExamItems, selected: ExamItems) {
		return item.examid === selected.examid;
	}

	change_selected_major(selected_major: any) {
		this.selected_major = selected_major;
		this.showReport = false;

		this.fetchContent();
	}

	fetchContent(
		spreadsheet?: boolean
	) {
		// console.warn(this.pathParams);
		let params = "";
		const annualEgroupIdParam = this.schoolTypeData?.isGuineaSchool ? "annual_egroup_id" : "annualegroupid";
		if (this.fetchDataCount == 0) {
			if (this.pathParams.streamid > 0) {
				params = "?streamid=" + this.pathParams.streamid;
			} else if (this.pathParams.intakeid > 0) {
				params = "?intakeid=" + this.pathParams.intakeid;
			}

			if (this.pathParams.seriesid > 0) {
				params += "&seriesid=" + this.pathParams.seriesid;
			} else if (this.pathParams.egroupid > 0) {
				params += "&egroupid=" + this.pathParams.egroupid;
			} else if (this.pathParams.annual_egroup_id > 0) {
				params += `&${annualEgroupIdParam}=` + this.pathParams.annual_egroup_id;
			}
		} else {
			if (this.selected_stream.streamid && this.selected_stream.streamid > 0) {
				params = "?streamid=" + this.selected_stream.streamid;
			} else if (this.selected_stream.intakeid && this.selected_stream.intakeid > 0) {
				params = "?intakeid=" + this.selected_stream.intakeid;
			}

			if (this.selected_exam.seriesid && this.selected_exam.seriesid > 0) {
				params += "&seriesid=" + this.selected_exam.seriesid;
			} else if (this.selected_exam.egroupid && this.selected_exam.egroupid > 0) {
				params += "&egroupid=" + this.selected_exam.egroupid;

			} else if (this.selected_exam.annual_egroup_id && this.selected_exam.annual_egroup_id > 0) {
				params += `&${annualEgroupIdParam}=` + this.selected_exam.annual_egroup_id;
			} if (
				this.selected_major &&
				this.selected_major > 0
			) {
				params += "&majorid=" + this.selected_major;

			}
		}

		if (spreadsheet) {
			params += "&spreadsheet=true";
		}

		params += "&mobile=" + this.isMobileApp;

		this.isLoadingData = true;
		this.examService.getStreamIntakeExamData(params).subscribe((resp: any) => {
			if (spreadsheet && resp && resp?.generated_spreadsheet) {
				const file_name = resp.generated_spreadsheet;
				this.examService.getFile(file_name).subscribe({
					next: (resp: any) => {
						const blob = new Blob([resp.data], { type: "application/vnd.ms-excel" });
						saveAs(blob, file_name);
					},
					error: err => {
						this.responseHandler.error(err, "fetchContent()");
					}
				});
			} else {
				this.classData = resp;
				this.majors = (resp && resp.exam_majors) ? resp.exam_majors : [];

				const setDefaultMajor = this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;

				if (setDefaultMajor) this.setDefaultMajor();
				this.classData.exams = this.classData?.exams?.reverse();
				this.sortedData = this.classData?.subjects?.list;
				this.loadData();
			}
			this.isLoadingData = false;
		}, () => {
			this.isLoadingData = false;
			this.loadingDataFailed = true;
		});
	}

	setDefaultMajor() {
		if (this.majors && this.majors.length > 0) {
			this.classData.exam_majors.map((major) => {
				major.majorId = major.id;
			});
		}
		if (!this.selected_major) this.selected_major = this.majors[0]?.majorId;
	}

	stateparams: any = {};
	viewPrintFormat() {
		this.show_top_students.subjects = false;
		this.stateparams = {
			intakeid: this.classData?.intakeid,
			seriesid: this.classData?.seriesid,
			egroupid: this.classData?.egroupid,
			streamid: this.selected_stream.streamid
		};
		// console.warn(">>", this.stateparams);
		this.showReport = true;
	}

	sortedData: Array<any> = [];
	sortData(sort: Sort) {
		const data = this.classData?.subjects?.list.slice();
		if (!sort.active || sort.direction === "") {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			const isAsc = sort.direction === "asc";
			switch (sort.active) {
			case "name":
				return compare(a.subject, b.subject, isAsc);
			case "points":
				return compare(a.value, b.value, isAsc);
			case "change":
				return compare(a.change, b.change, isAsc);
			case "grade":
				return compare(a.grade, b.grade, isAsc);
			default:
				return 0;
			}
		});
	}
	getAnalysisData() {
		return analysisExamGuinea;
	}
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
