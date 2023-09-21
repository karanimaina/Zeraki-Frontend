import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { HotToastService } from "@ngneat/hot-toast";
import * as Highcharts from "highcharts";
// fonts provided for pdfmake
import { DataService } from "src/app/@core/shared/services/data/data.service";
import * as html2pdf from "html2pdf.js";
import { environment } from "src/environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { SchoolService } from "../../../../../../@core/shared/services/school/school.service";
import { analysisExamGuinea } from "src/app/@core/constants/analysisExamGuinea";
import { PrintoutsService } from "src/app/@core/services/printouts/printouts.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-class-analysis",
	templateUrl: "./class-analysis.component.html",
	styleUrls: ["./class-analysis.component.scss"]
})
export class ClassAnalysisComponent implements OnInit {
	@Input() items: any;
	@Input() guinea_graphData: any;
	cparams: any;

	/**Get user roles from subject */
	user_roles$: Observable<Role> = this.roleService.roleSubject;

	schoolTypeData: any;
	school_profile: any;
	school_logo_path: any;
	all_forms_list: any[] = [];
	exams: any[] = [];
	selected: any = {};
	stateparams: {
		intakeid: number;
		streamid: number;
		subjectid: number;
		seriesid: number;
		egroupid: number;
		classid: number;
	} = {
			intakeid: 0,
			streamid: 0,
			subjectid: 0,
			seriesid: 0,
			egroupid: 0,
			classid: 0
		};
	fetching_examsData_inprogress = false;
	fetching_examsList_inprogress = false;
	no_exams_msg = "";

	show_data = false;
	isMobileApp = false;
	selected_kcse_mean: any = {};
	show_top_students: any = {};
	print_options: any = {};
	sorthouses = { type: "overall", reverse: true };

	sortdata: any = {};
	sortdata_print: any = {};

	classData: any = {};

	fetchDataCount = 0;

	streams: any[] = [];
	selected_stream: any = {};
	selected_exam: any = {};
	grade_breakdown: any = {};

	timeseries_examseries: any[] = [];
	timeseries_examseries_min: any;
	timeseries_examseries_max: any;

	timeseries_examgroup: any[] = [];
	timeseries_examgroup_min: any;
	timeseries_examgroup_max: any;
	kcse_mean_time_series_exists = false;
	timeSeriesExamSeries_kcse: any[] = [];
	timeSeriesExamSeries_kcse_min: any;
	timeSeriesExamSeries_kcse_max: any;

	no_data = true;
	loaded = false;
	isPrinting = false;
	showReport = true;

	@ViewChild("printthis") printthis?: ElementRef;

	isHighcharts = typeof Highcharts === "object";

	Highcharts_subMeans: typeof Highcharts = Highcharts;
	highchart_subject_mean: Highcharts.Options = {
		chart: {
			renderTo: "container",
			height: 400
		},
		credits: {
			enabled: false
		},
		title: {
			text: ""
		},
		legend: {
			enabled: false
		},
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
		series: [
			{
				data: [],
				type: "column"
			}
		],
		exporting: {
			enabled: false
		}
	};

	Highcharts_classStats: typeof Highcharts = Highcharts;
	highchart_students_per_grade: Highcharts.Options = {
		chart: {
			renderTo: "container",
			height: 400
		},
		credits: {
			enabled: false
		},
		title: {
			text: ""
		},
		legend: {
			enabled: false
		},
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
		series: [
			{
				data: [],
				type: "column"
			}
		],
		exporting: {
			enabled: false
		}
	};

	Highcharts: typeof Highcharts = Highcharts;
	highchart_stream_comparison: Highcharts.Options = {
		chart: {
			height: 190,
			type: "line" //In TypeScript this option has no effect in sense of typing and instead the `type` option must always be set in the series.
		},
		title: {
			text: ""
		},
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
		legend: { enabled: false },
		series: [
			{
				name: "Stream  Mean",
				pointPlacement: "on",
				data: [],
				type: "area",
				showInLegend: false,
				color: {
					linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
					stops: [
						[0, "#43ab49"], // start
						// [0.5, '#3366AA'], // middle
						[1, "#ffffff"] // end
					]
				},
				fillOpacity: 0.35
			}
		]
	};

	HighchartStreams: typeof Highcharts = Highcharts;
	highchart_time_series: Highcharts.Options = {
		title: {
			text: ""
		},
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
			max: 12 //gridLineColor: 'rgba(228, 229, 231, 0.60)'
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
				}
				// pointStart: 2010
			}
		},
		series: [],
		chart: {
			height: 400
		},

		responsive: {
			rules: [
				{
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
				}
			]
		}
	};

	// classData = CLASS_DATA;
	sortedData: any[] = [];
	// items = ["Overall", "Maths", "Chemistry"];
	// selectedItem: string = ''

	// // selectedAccount = '';
	// accounts = [
	//     { name: 'Mid-T2', email: 'adam@email.com', age: 12, country: 'Form 1 - Term 2 (2020)', child: { state: 'Active' } },
	//     { name: 'Test 3', email: 'homer@email.com', age: 47, country: 'Form 2 - Term 2 (2021)', child: { state: 'Active' } },
	//     { name: 'Mid Term', email: 'samantha@email.com', age: 30, country: 'Form 2 - Term 2 (2021)', child: { state: 'Active' } },
	//     { name: 'End Of Term 2', email: 'amalie@email.com', age: 12, country: 'Form 2 - Term 2 (2021)', child: { state: 'Active' } }
	// ];

	constructor(
		private dataService: DataService,
		private roleService: RolesService,
		private studentsService: StudentsService,
		private printoutsService: PrintoutsService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private schoolService: SchoolService
	) {}

	ngOnInit(): void {
		console.log(this.items);
		this.isMobileApp = this.dataService.getIsMobileApp();
		this.selected_kcse_mean.item = null;
		this.show_top_students.subjects = false;
		this.show_top_students.only = false;
		this.show_top_students.hide_all = false;
		this.print_options.one_subject_per_page = false;

		this.sortdata.type = "code";
		this.sortdata.reverse = false;

		this.sortdata_print.type = "value";
		this.sortdata_print.reverse = true;
		this.getSchoolTypeData();
		this.getSchool_profile();

		if (this.items?.intakeid || this.items?.seriesid) {
			this.cparams = {
				intakeid: this.items?.intakeid,
				seriesid: this.items?.seriesid,
				egroupid: this.items?.egroupid,
				streamid: this.items?.streamid
			};

			this.stateparams.intakeid = this.cparams.intakeid;
			this.stateparams.seriesid = this.cparams.seriesid;
			this.stateparams.egroupid = this.cparams.egroupid;
			this.stateparams.streamid = this.cparams.streamid;

			this.fetching_examsData_inprogress = true;
			this.fetchContent();
		}
	}

	getSchool_profile() {
		this.schoolService.schoolInfo.subscribe((resp) => {
			// console.warn("getSchool_profile() >> ", resp);
			this.school_profile = resp;

			const image_root = environment.apiurl + "/groups/images/";
			if (
				this.school_profile.logo !== undefined &&
				this.school_profile.logo !== null &&
				this.school_profile.logo.length > 0
			) {
				if (this.school_profile.logo.includes("http")) {
					this.school_logo_path = this.school_profile.logo;
				} else {
					this.school_logo_path = image_root + this.school_profile.logo;
				}
			} else {
				this.school_logo_path = "../../../../assets/img/default-logo.png";
			}
		});
	}

	onTopStudentsHideAllChange() {
		if (this.show_top_students.hide_all) {
			this.show_top_students.only = false;
		} else {
			this.show_top_students.subjects = true;
		}
	}

	onTopStudentsSubjectsChange() {
		if (!this.show_top_students.subjects) {
			this.show_top_students.only = false;
		}
	}

	onTopStudentsOnlyChange() {
		if (this.show_top_students.only) {
			this.show_top_students.subjects = true;
			this.show_top_students.hide_all = false;
		}
	}

	onKcseMeanChange() {
		this.classData.subjects.list.forEach((sb: any) => {
			let previous_mean: any;
			if (this.selected_kcse_mean.item) {
				previous_mean = this.selected_kcse_mean.item[sb.text_code];
			}

			if (!previous_mean) {
				previous_mean = 0.0;
			}
			if (!previous_mean || !this.selected_kcse_mean.item) {
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
			let previous_mean: any;
			if (this.selected_kcse_mean.item) {
				previous_mean = this.selected_kcse_mean.item["OVERALL"];
			}
			if (!previous_mean) {
				previous_mean = 0.0;
				this.classData.kcse_mean_change = 0;
			}
			if (
				previous_mean == null ||
				previous_mean == undefined ||
				this.selected_kcse_mean.item == null ||
				this.selected_kcse_mean.item == undefined
			) {
				this.classData.kcse_mean_change = 0;
			} else {
				this.classData.aggregate_stats.second = {};
				if (previous_mean > 0) {
					this.classData.kcse_mean_change =
						this.classData.aggregate_stats.first.value - previous_mean;
					this.classData.aggregate_stats.second.name = "Previous Points";
					this.classData.aggregate_stats.second.value = parseFloat(
						previous_mean.toFixed(4)
					);
					this.classData.aggregate_stats.second.change =
						"(KCSE " + this.selected_kcse_mean.item["year"] + ")";
				}
			}
		}
	}

	loadData() {
		this.selected_kcse_mean.item = null;
		this.streams = this.classData.streams;
		this.exams = this.classData.exams;
		this.streams.forEach((stream, i) => {
			if (this.classData.current_streamintake_value == stream.value) {
				this.selected_stream = this.streams[i];
			}
		});
		this.exams.forEach((exam: any, i: any) => {
			if (
				this.classData.examid == exam.examid &&
				this.classData.examtype == exam.type
			) {
				this.selected_exam = this.exams[i];
			}
		});
		if (
			this.classData.merit_summary_list != undefined &&
			this.classData.merit_summary_list.length > 0
		) {
			this.grade_breakdown = {};
			this.grade_breakdown.current_item = this.classData.merit_summary_list[0];
		}

		if (this.classData.stream_comparison != undefined) {
			const streams_performances: any[] = [];
			this.classData.stream_comparison.list.forEach((sc: any) => {
				streams_performances.push({ name: sc.stream_name, y: sc.value });
			});
			// this.highchart_stream_comparison.yAxis.min = this.classData.stream_comparison.min;
			// this.highchart_stream_comparison.yAxis.max = this.classData.stream_comparison.max;
			// this.highchart_stream_comparison.series[0].data = streams_performances;
			this.highchart_stream_comparison = {
				credits: {
					enabled: false
				},
				chart: {
					height: 190,
					type: "line" //In TypeScript this option has no effect in sense of typing and instead the `type` option must always be set in the series.
				},
				title: {
					text: ""
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
					min: this.classData.stream_comparison.min,
					max: this.classData.stream_comparison.max,
					gridLineColor: "rgba(228, 229, 231, 0.60)"
				},
				legend: { enabled: false },
				series: [
					{
						name: "Stream  Mean",
						pointPlacement: "on",
						data: streams_performances,
						type: "area",
						showInLegend: false,
						color: {
							linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
							stops: [
								[0, "#43ab49"], // start
								// [0.5, '#3366AA'], // middle
								[1, "#ffffff"] // end
							]
						},
						fillOpacity: 0.35
					}
				]
			};
		}

		if (this.classData.subjects != undefined) {
			const categories_subject: any[] = [];
			const data_subject: any[] = [];
			this.classData.subjects.list.forEach((s: any) => {
				categories_subject.push(s.text_code);
				data_subject.push(s.value);
			});
			// this.highchart_subject_mean.series = [{
			//     name: this.classData.subjects.value_type,
			//     data: data_subject,
			//     showInLegend: false
			// }];
			// this.highchart_subject_mean.xAxis.categories = categories_subject;
			// this.highchart_subject_mean.yAxis.title.text = this.classData.subjects.value_type;

			this.highchart_subject_mean = {
				credits: {
					enabled: false
				},
				chart: {
					renderTo: "container",
					height: 400
				},
				title: {
					text: ""
				},
				legend: {
					enabled: false
				},
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
				series: [
					{
						name: this.classData.subjects.value_type,
						data: data_subject,
						type: "column",
						showInLegend: false
					}
				],
				exporting: {
					enabled: false
				}
			};
		}

		if (
			this.classData.current_class_grade_count_summary != undefined &&
			this.classData.current_class_grade_count_summary.length > 0
		) {
			const categories_grades: any[] = [];
			const data_grades: any[] = [];
			this.classData.current_class_grade_count_summary.forEach((g: any) => {
				categories_grades.push(g.grade);
				data_grades.push(g.count);
			});
			// this.highchart_students_per_grade.series = [{
			//     name: "Number of Students",
			//     data: data_grades,
			//     showInLegend: false
			// }];
			// this.highchart_students_per_grade.xAxis.categories = categories_grades;

			this.highchart_students_per_grade = {
				credits: {
					enabled: false
				},
				chart: {
					renderTo: "container",
					height: 400
				},
				title: {
					text: ""
				},
				legend: {
					enabled: false
				},
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
				series: [
					{
						name: "Number of Students",
						data: data_grades,
						type: "column",
						showInLegend: false
					}
				],
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.timeseries != undefined) {
			if (this.classData.timeseries.examseries != undefined) {
				this.timeseries_examseries = [];
				this.timeseries_examseries_min =
					this.classData.timeseries.examseries.min;
				this.timeseries_examseries_max =
					this.classData.timeseries.examseries.max;
				let newstreamDataObj: any[] = [];
				this.classData.timeseries.examseries.list.forEach((stream: any) => {
					stream.data.forEach((sd: any) => {
						// CHANGING SERIESID TO ID FOR HIGHCHARTS TO WORK HENCE THE NEW OBJECT newObject replacing sd.
						// delete Object.assign(sd, {id: sd.seriesid }).seriesid;
						const newObject: any = {};
						delete Object.assign(newObject, sd, { id: sd.seriesid }).seriesid;

						if (
							newObject.value == undefined ||
							newObject.value == null ||
							newObject.value < 0
						) {
							newObject.y = null;
						} else {
							newObject.y = newObject.value;
						}
						newObject.id = newObject.id.toString();
						newstreamDataObj = [...newstreamDataObj, newObject];
					});
					// this.timeseries_examseries.push({
					//   name: stream.streamname,
					//   colorByPoint: false,
					//   cursor: 'pointer',
					//   type: 'line',
					//   marker: {symbol: 'circle'},
					//   data: stream.data,
					// });

					const ids = newstreamDataObj.map((obj) => obj.id);
					const filtered = newstreamDataObj.filter(
						({ id }, index) => !ids.includes(id, index + 1)
					);
					// console.warn("newstreamDataObj >> ", newstreamDataObj);
					// console.warn("stream.data >> ", stream.data);
					// console.warn("filtered >> ", filtered);
					this.timeseries_examseries = [
						...this.timeseries_examseries,
						{
							name: stream.streamname,
							colorByPoint: false,
							cursor: "pointer",
							type: "line",
							marker: { symbol: "circle" },
							data: filtered
						}
					];
					// console.warn("this.timeseries_examseries.push >> ", this.timeseries_examseries);
				});
			}

			if (this.classData.timeseries.examgroup != undefined) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.classData.timeseries.examgroup.min;
				this.timeseries_examgroup_max = this.classData.timeseries.examgroup.max;
				this.classData.timeseries.examgroup.list.forEach((stream: any) => {
					stream.data.forEach((sd: any) => {
						if (sd.value == undefined || sd.value == null || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_examgroup.push({
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						type: "line",
						marker: { symbol: "circle" },
						data: stream.data
					});
				});
			}
			if (this.classData.timeseries.annualEgroup != undefined) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.classData.timeseries.annualEgroup.min;
				this.timeseries_examgroup_max = this.classData.timeseries.annualEgroup.max;
				this.classData.timeseries.annualEgroup.list.forEach((stream: any) => {
					stream.data.forEach((sd: any) => {
						if (sd.value == undefined || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_examgroup.push({
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						type: "line",
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
				if (
					this.classData.kcse_means_previous != undefined &&
					this.classData.kcse_compare
				) {
					const kcse_mean_time_series_data: any = [];
					this.classData.kcse_means_previous.forEach((km: any) => {
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
						const previous_index =
							this.classData.kcse_means_previous.length - 1;
						this.selected_kcse_mean.item =
							this.classData.kcse_means_previous[previous_index];
						this.onKcseMeanChange();
					}
				}

				this.show_top_students.hide_all = false;
				if (this.classData.kcse_means_previous != undefined) {
					this.show_top_students.hide_all = true;
				}
			}

			if (this.classData.kcse_compare && this.kcse_mean_time_series_exists) {
				// this.highchart_time_series.series = this.timeSeriesExamSeries_kcse;
				// this.highchart_time_series.yAxis.min = this.timeSeriesExamSeries_kcse_min;
				// this.highchart_time_series.yAxis.max = this.timeSeriesExamSeries_kcse_max;

				// console.warn("highchart_time_series 0");

				this.highchart_time_series = {
					title: {
						text: ""
					},
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
						//gridLineColor: 'rgba(228, 229, 231, 0.60)'
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
							}
							// pointStart: 2010
						}
					},
					series: this.timeSeriesExamSeries_kcse,
					chart: {
						height: 400
					}

					// responsive: {
					//     rules: [{
					//         // condition: {
					//         //     maxWidth: 600
					//         // },
					//         chartOptions: {
					//             legend: {
					//                 layout: 'horizontal',
					//                 align: 'center',
					//                 verticalAlign: 'bottom'
					//             }
					//         }
					//     }]
					// }
				};
			} else if (this.classData.examtype == 1) {
				// this.highchart_time_series.series = this.timeseries_examseries;
				// this.highchart_time_series.yAxis.min = this.timeseries_examseries_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examseries_max;

				// console.warn("highchart_time_series 1");
				// console.warn("this.timeseries_examseries final >> ", this.timeseries_examseries);
				this.highchart_time_series = {
					title: {
						text: ""
					},
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
						//gridLineColor: 'rgba(228, 229, 231, 0.60)'
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
							}
							// pointStart: 2010
						}
					},
					series: this.timeseries_examseries,
					chart: {
						height: 400
					},

					responsive: {
						rules: [
							{
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
							}
						]
					}
				};
			} else if (this.classData.examtype > 1) {
				// console.warn("highchart_time_series 2");
				this.highchart_time_series = {
					title: {
						text: ""
					},
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
						//gridLineColor: 'rgba(228, 229, 231, 0.60)'
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
							}
							// pointStart: 2010
						}
					},
					series: this.timeseries_examgroup,
					chart: {
						height: 400
					}

					// responsive: {
					//     rules: [{
					//         // condition: {
					//         //     maxWidth: 600
					//         // },
					//         chartOptions: {
					//             legend: {
					//                 layout: 'horizontal',
					//                 align: 'center',
					//                 verticalAlign: 'bottom'
					//             }
					//         }
					//     }]
					// }
				};
			}
		}
		if (this.fetchDataCount > 0) {
			// this.reAnimateViews();
		}
		this.fetchDataCount++;
		this.show_data = true;
		this.fetching_examsData_inprogress = false;
	}

	fetchContent(spreadsheet = false) {
		// console.warn("this.stateparams >> ", this.stateparams);
		let params = "";
		// console.warn("First if");
		if (this.stateparams.streamid > 0) {
			params = "?streamid=" + this.stateparams.streamid;
		} else if (this.stateparams.intakeid > 0) {
			params = "?intakeid=" + this.stateparams.intakeid;
		}
		// console.warn("new params >> ", params)

		if (this.stateparams.seriesid > 0) {
			params += "&seriesid=" + this.stateparams.seriesid;
		} else if (this.stateparams.egroupid > 0) {
			params += "&egroupid=" + this.stateparams.egroupid;
		}

		if (spreadsheet) {
			params += "&spreadsheet=true";
		}

		params += "&mobile=" + this.isMobileApp;
		// console.warn("params", params);
		if (spreadsheet) {
			this.studentsService
				.getStreamIntakeExamData(params, false, true)
				.subscribe({
					next: (resp_success: any) => {
						const blob = new Blob([resp_success], {
							type: "application/vnd.ms-excel"
						});
						this.printoutsService.custom_saver(
							blob,
							`${this.classData.classname}_${
								this.classData.examname
							}_Analysis_Report_${new Date().getTime()}`
						);
					},
					error: (error) => {
						console.error(error);
						const message = this.translate.instant(
							"exams.classAnalysis.toastMessages.fetchContentError"
						);
						this.toastService.error(message);
					}
				});
		} else {
			this.studentsService
				.getStreamIntakeExamData(params, false)
				.subscribe((resp: any) => {
					if (resp) {
						if (resp?.kcse_compare) {
							const kcseIndex =
								resp?.labels_current_class_summary?.indexOf("MP Dev");
							resp?.labels_current_class_summary?.splice(kcseIndex, 1);
						}
						this.classData = resp;
						this.loaded = true;
						this.sortedData = this.classData.subjects.list.slice();
						this.loadData();
						this.classData.aggregate_stats.entries > 0
							? (this.no_data = false)
							: (this.no_data = true);
					}
				});
		}
	}

	checkSchoolAuthenticatedStatus() {
		this.dataService.getUserInitialization().subscribe((resp) => {
			// console.warn("getUserInitialization() >> ", resp);
			const user_init: any = resp;
			if (!user_init.school_validity_info?.is_valid_school) {
				// this.router.navigateByUrl("/");
			}
		});
	}

	invalidateStreams() {
		this.selected.stream = {};
		if (this.selected.intake == null) {
			this.exams = [];
		}
	}

	fetchIntakeStreamExams(
		intake: any,
		stream: any,
		seriesid: any = null,
		egroupid: any = null
	) {
		let params = "";
		let has_state_params = false;
		let has_selected_exam = false;
		if (
			(seriesid != null && seriesid.length > 0) ||
			(egroupid != null && egroupid.length > 0)
		) {
			has_state_params = true;
		}

		if (seriesid == null) {
			seriesid = "";
		}
		if (egroupid == null) {
			egroupid = "";
		}

		if (this.selected.exam != null) {
			if (this.selected.exam.seriesid != null) {
				seriesid = this.selected.exam.seriesid;
				seriesid = seriesid.toString();
				has_selected_exam = true;
			} else if (this.selected.exam.egroupid != null) {
				egroupid = this.selected.exam.egroupid;
				egroupid = egroupid.toString();
				has_selected_exam = true;
			}
		}

		if (stream != null && stream.streamid != null) {
			params = "?streamid=" + stream.streamid + "&mobile=false";
		} else if (intake != null && intake.intakeid != null) {
			params = "?intakeid=" + intake.intakeid + "&mobile=false";
		}

		if (params.length > 0) {
			if (!has_state_params) {
				this.fetching_examsList_inprogress = true;
				this.exams = [];
				this.selected.exam = {};
			} else {
				this.fetching_examsData_inprogress = true;
			}
			this.no_exams_msg = "";

			this.studentsService
				.getStreamIntakeExamData(params, true)
				.subscribe((response: any) => {
					this.exams = response.exams;
					this.fetching_examsList_inprogress = false;
					this.fetching_examsData_inprogress = false;
					if (this.exams == null || this.exams.length == 0) {
						this.exams = [];
						this.no_exams_msg = "No Exams Found";
					} else {
						if (has_state_params || has_selected_exam) {
							this.exams.forEach((exam: any) => {
								if (
									seriesid.length > 0 &&
									exam.seriesid != null &&
									exam.seriesid == seriesid
								) {
									this.selected.exam = exam;
								} else if (
									egroupid.length > 0 &&
									exam.egroupid != null &&
									exam.egroupid == egroupid
								) {
									this.selected.exam = exam;
								}
							});
						}
					}
				});
		}
	}

	getAnalysisReport() {
		// this.selected_exam = this.selected.exam;
		let seriesid = 0;
		let egroupid = 0;
		let intakeid = 0;
		let streamid = 0;
		if (
			this.selected.stream != undefined &&
			this.selected.stream != null &&
			this.selected.stream.streamid != undefined &&
			this.selected.stream.streamid != null &&
			this.selected.stream.streamid > 0
		) {
			streamid = this.selected.stream.streamid;
		} else if (
			this.selected.intake != undefined &&
			this.selected.intake != null &&
			this.selected.intake.intakeid != undefined &&
			this.selected.intake.intakeid != null &&
			this.selected.intake.intakeid > 0
		) {
			intakeid = this.selected.intake.intakeid;
		}

		if (this.selected.exam != undefined && this.selected.exam != null) {
			// console.warn("SELECTED EXAM >> ", this.selected.exam);
			if (
				this.selected.exam.seriesid != undefined &&
				this.selected.exam.seriesid != null &&
				this.selected.exam.seriesid > 0
			) {
				seriesid = this.selected.exam.seriesid;
			} else if (
				this.selected.exam.egroupid != undefined &&
				this.selected.exam.egroupid != null &&
				this.selected.exam.egroupid > 0
			) {
				egroupid = this.selected.exam.egroupid;
			}
		}

		// //$scope.fetching_examsData_inprogress = true;
		// $state.go("home.printouts.classanalysis.report.r", {
		//     intakeid: intakeid,
		//     streamid: streamid,
		//     seriesid: seriesid,
		//     egroupid: egroupid
		// });

		this.stateparams.intakeid = intakeid;
		this.stateparams.streamid = streamid;
		this.stateparams.seriesid = seriesid;
		this.stateparams.egroupid = egroupid;

		this.fetching_examsData_inprogress = true;
		this.fetchContent();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe((val) => {
			// console.warn("getSchoolTypeData() >> ", val);
			this.schoolTypeData = val;
		});
	}

	// async generatePdf(action: string) {
	// 	this.isExporting = true;
	//   let doc_headers: string[] = [];
	//   doc_headers = [...this.document_headers];
	//   if (this.show_phone) {
	//     doc_headers.push("PHONE");
	//   }
	//   doc_headers.push("", "", "", "");
	//   doc_headers.splice(0, 2);
	// 	const exportList = [...this.data];
	// 	const newExportList = exportList.map((x: any) => Object.assign({}, x));
	// 	const table = [];
	//   table.push([{text: this.pdf_title, colSpan: 10, alignment: 'center'}, "", "", "", "", "", "", "", "", ""]);
	// 	table.push(doc_headers);
	// 	newExportList.map((value: any) => {
	//     let student_data = [];
	//     student_data.push(value.admno || '');
	//     if (this.show_upi) {
	//         student_data.push(value.upi || '');
	//     }
	//     student_data.push(value.name || '');
	//     if (this.show_stream) {
	//         student_data.push(value.stream || '');
	//     }
	//     if (this.show_kcpe) {
	//         student_data.push(value.kcpe || '');
	//     }
	//     if (this.showGender) {
	//       student_data.push(value.gender || '');
	//     }
	//     if (this.show_phone) {
	//         student_data.push(value.phone || '');
	//     }
	//     student_data.push('','','','');

	// 		table.push(student_data);
	// 	});

	// 	this.createdPDF = await this.printoutsService.generatePdfReport(this.school, this.school_logo_path, "Class List", table, ["*", 100, "*", "*", "*", "*", "*", "*", "*", "*"], "A3");

	// 	if (action === "print") {
	// 		this.createdPDF.print();
	// 	} else {
	// 		this.createdPDF.download(`Class-List_${this.pdf_title}`);
	// 	}

	// 	this.isExporting = false;
	// }

	// async generatePdf() {
	//   html2canvas(this.printthis?.nativeElement, {scrollY: -window.scrollY,
	//     scale: 1}).then(async canvas => {
	//     let imgWidth = 208;
	//     let pageHeight = 295;
	//     let imgHeight = canvas.height * imgWidth / canvas.width;
	//     let heightLeft = imgHeight;
	//     const canvasResult = canvas.toDataURL("image/png");
	//     document.body.appendChild(canvas)
	//     // console.log(canvasResult);

	//     PdfMakeWrapper.setFonts(pdfFonts);
	//     const pdf: PdfMakeWrapper = new PdfMakeWrapper();
	//     pdf.pageOrientation('portrait');
	//     pdf.defaultStyle({
	//       fontSize: 7
	//     });
	//     pdf.pageSize('A4');

	//     // pdf.add( new Txt('Tmp Verwaltungs GmbH - Stundennachweis').alignment('left').fontSize(15).bold().end);

	//     // pdf.add( await new Img('/assets/images/tmp-logo.png').fit([100, 70]).alignment('right').margin([0, 20]).build());

	//   pdf.add( await new Img(canvasResult).height(4000).width(500).margin([0, 0, 0, 0]).build());
	//   // pdf.pageMargins([ 40, 60, 40, 60 ]);
	//   // pdf.info({
	//   //   title: 'Test - Test',
	//   // });
	//    // pdf.pageOrientation('landscape');

	//   pdf.create().print();
	//   });

	// }

	printPage2(printSectionId: string) {
		const innerContents = document.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open(
			"",
			"_blank",
			"width=device-width, initial-scale=1.0"
		);
		popupWinindow?.document.open();
		popupWinindow?.document.write(
			"<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"../../../../styles.scss\"><link rel=\"stylesheet\" href=\"../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css\"><link rel=\"stylesheet\" href=\"../../../../assets/css/vendors_css.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" +
				innerContents +
				"</html>"
		);
		popupWinindow?.document.close();
		// setTimeout(function () {
		//   popupWinindow?.print();
		// }, 500);
	}

	generatePdf() {
		const element = document.getElementById("printbody");
		html2pdf(element);
	}

	download() {
		this.isPrinting = true;
		const element = document.getElementById("printbody");
		const opt = {
			filename: "Analysis report.pdf",
			image: { type: "jpeg", quality: 0.98 },
			jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
			html2canvas: { scale: 2 },
			pagebreak: { mode: "avoid-all", before: ".break-before" }
		};

		// New Promise-based usage:
		html2pdf().from(element).set(opt).save();
		this.isPrinting = false;
	}

	sortData(sort: Sort) {
		const data = this.classData.subjects.list.slice();
		if (!sort.active || sort.direction === "") {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a: any, b: any) => {
			const isAsc = sort.direction === "asc";
			switch (sort.active) {
			case "subject":
				return compare(a.subject, b.subject, isAsc);
			case "value":
				return compare(a.value, b.value, isAsc);
			case "previous":
				return compare(a.previous, b.previous, isAsc);
			case "change":
				return compare(a.change, b.change, isAsc);
				// case 'grade': return compare(a.grade, b.grade, isAsc);
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
