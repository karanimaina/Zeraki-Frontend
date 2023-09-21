import { Component, OnInit } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import * as Highcharts from "highcharts";
import { Router } from "@angular/router";
import {SchoolService} from "../../@core/shared/services/school/school.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { JointAccountService } from "src/app/@core/services/exams/joint/joint-account.service";

@Component({
	selector: "app-analysis",
	templateUrl: "./analysis.component.html",
	styleUrls: ["./analysis.component.scss"]
})
export class AnalysisComponent implements OnInit {
	show_data = false;
	isMobileApp: boolean = this.dataService.getIsMobileApp();
	selected_kcse_mean: any = {};
	show_top_students: any = {};
	sorthouses: any = { type: "overall", reverse: true };
	streams: any;
	exams: any;
	grade_breakdown: any = {};
	timeseries_examgroup: any[] = [];
	timeseries_examgroup_min: any;
	timeseries_examgroup_max: any;
	showReport!: boolean;
	selected_stream_value: any;

	isLoading = false;
	hasError = false;
	loadingCount = 0;

	school_profile: any;
	user_info: any;

	constructor(
    private jointService: JointAccountService,
    private dataService: DataService,
	private userService: UserService,
    private schoolService: SchoolService,
    private router: Router
	) { }

	ngOnInit(): void {

		this.schoolService.schoolInfo.subscribe((r) => { this.school_profile = r; });
		this.userService.userInfoSubject.subscribe((r) => { this.user_info = r; });
		this.initVariables();

	}

	initVariables() {
		this.show_top_students.subjects = false;
		this.show_top_students.only = false;
		this.selected_kcse_mean.item = null;
		this.sortdata.type = "code";
		this.sortdata.reverse = false;
		this.fetchContent();
		this.showReport = false;
	}


	onTopStudentsSubjectsChange() {
		if (!this.show_top_students.subjects) {
			this.show_top_students.only = false;
		}
	}
	onTopStudentsOnlyChange() {
		if (this.show_top_students.only) {
			this.show_top_students.subjects = true;
		}
	}
	sortdata: any = {};
	selected_stream: any = {};
	selected_exam: any = {};
	classData: any = {};
	viewSubjectPerformance(s: any) {
		let seriesid = "";
		let egroupid = "";
		let subjectid = "";
		let intakeid = "";
		let classid = "";
		if (this.selected_stream.streamid != undefined && this.selected_stream.streamid != null && this.selected_stream.streamid > 0) {
			classid = s.classid;
		} else if (this.selected_stream.intakeid != undefined && this.selected_stream.intakeid != null && this.selected_stream.intakeid > 0) {
			intakeid = this.selected_stream.intakeid;
			subjectid = s.subjectid;
		}

		if (this.selected_exam.seriesid != undefined && this.selected_exam.seriesid != null && this.selected_exam.seriesid > 0) {
			seriesid = this.selected_exam.seriesid;
		} else if (this.selected_exam.egroupid != undefined && this.selected_exam.egroupid != null && this.selected_exam.egroupid > 0) {
			egroupid = this.selected_exam.egroupid;
		}



		// $state.go("home.analytics.streams_subject", {
		//   seriesid: seriesid,
		//   egroupid: egroupid,
		//   subjectid: subjectid,
		//   intakeid: intakeid,
		//   classid: classid
		// });
	}

	viewMeritList(subjectid_passed?: any) {
		let schoolid = "-1";
		let subjectid = "-1";
		if (this.selected_stream_value != undefined && this.selected_stream_value.indexOf("jointexam") == -1) {
			schoolid = this.selected_stream_value;
		}
		if (subjectid_passed != undefined && subjectid_passed != null && subjectid_passed > 0) {
			subjectid = subjectid_passed;
		}

		// console.log(schoolid)
		// console.log(subjectid_passed)
		// return;
		// this.router.navigate(['/joint/h/merit-list',seriesid,egroupid,subjectid,intakeid,classid])
		this.router.navigate(["/joint/h/merit-list", schoolid, subjectid]);
		// $state.go("home.joint_form_merit_list", { schoolid: schoolid, subjectid: subjectid });
	}
	onKcseMeanChange() {
		this.classData.subjects.list.forEach((sb: any, i: number) => {
			let previous_mean = null;
			if (this.selected_kcse_mean.item != null && this.selected_kcse_mean.item != undefined) {
				previous_mean = this.selected_kcse_mean.item[sb.text_code];
			}
			if (previous_mean == null || previous_mean == undefined || this.selected_kcse_mean.item == null || this.selected_kcse_mean.item == undefined) {
				sb.kcse_mean_change = 0;
			} else {
				sb.kcse_mean_change = sb.value - previous_mean;
			}
		});
		const handle_overall_mean = true;
		if (handle_overall_mean) {
			let previous_mean = null;
			if (this.selected_kcse_mean.item != null && this.selected_kcse_mean.item != undefined) {
				previous_mean = this.selected_kcse_mean.item["OVERALL"];
			}
			if (previous_mean == null || previous_mean == undefined || this.selected_kcse_mean.item == null || this.selected_kcse_mean.item == undefined) {
				this.classData.kcse_mean_change = 0;
			} else {
				this.classData.kcse_mean_change = this.classData.aggregate_stats.first.value - previous_mean;
			}
		}
	}
	mostImproved() {
		this.viewMeritList(true);
	}
	getBarColor(marks: any) {
		return this.jointService.getColorScheme(marks);
	}
	isHighcharts = typeof Highcharts === "object";
	HighchartStreams: typeof Highcharts = Highcharts;
	highchart_stream_comparison: Highcharts.Options = {
		title: { text: "" },
		credits:{enabled:false},
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
			labels: { y: 5, x: -2, },
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
		chart: { height: 190 },
		exporting: {
			enabled: false
		}
	};
	HighchartTimeSeries: typeof Highcharts = Highcharts;
	highchart_time_series: Highcharts.Options = {
		chart: { type: "line", height: 400 },
		scrollbar: { enabled: true },
		credits:{enabled:false},
		title: { text: "" },
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
		series: [],
		exporting: {
			enabled: false
		}
	};
	highchart_subject_mean: any = {
		options: {
			chart: { type: "column" },
			scrollbar: { enabled: true }
		},
		title: { text: null },
		credits:{enabled:false},
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
		size: { height: 400 },
		loading: false, exporting: {
			enabled: false
		}
	};
	highchart_students_per_grade: any = {
		options: {
			chart: { type: "column" },
			scrollbar: { enabled: true }
		},
		title: { text: null },
		credits:{enabled:false},
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
		size: { height: 400 },
		loading: false, exporting: {
			enabled: false
		}
	};
	fetchDataCount = 0;

	loadData() {
		this.exams = this.classData.exams;


		if (this.loadingCount == 1) {
			this.streams = this.classData.streams;
			this.streams.forEach((stream: any, i: number) => {
				if (this.classData.current_streamintake_value === stream.value) {
					this.selected_stream = stream;
					this.selected_stream_value = stream.value;
					return;
				}

			});
		}
		if (this.exams != undefined) {
			this.exams.forEach((exam: any, i: number) => {
				if (this.classData.examid == exam.examid && this.classData.examtype == exam.type) {
					this.selected_exam = this.exams[i];
				}
			});
		}

		if (this.classData.merit_summary_list != undefined && this.classData.merit_summary_list.length > 0) {
			this.grade_breakdown = {};
			this.grade_breakdown.current_item = this.classData.merit_summary_list[0];
		}

		if (this.classData.stream_comparison != undefined) {
			const streams_performances: any = [];
			this.classData.stream_comparison.list.forEach((sc: any, i: number) => {

				streams_performances.push({ name: sc.stream_name, y: sc.value });
			});
			// this.highchart_stream_comparison.yAxis.min = this.classData.stream_comparison.min;
			// this.highchart_stream_comparison.yAxis.max = this.classData.stream_comparison.max;
			// this.highchart_stream_comparison.series[0].data = streams_performances;

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
					labels: { y: 5, x: -2, },
					title: { text: "", align: "high" },
					min: this.classData.stream_comparison.min,
					max: this.classData.stream_comparison.max,
					gridLineColor: "rgba(228, 229, 231, 0.60)"
				},
				series: [{
					name: "Stream  Mean",
					pointPlacement: "on",
					data: streams_performances,
					type: "area",
					showInLegend: false,
					color: "rgba(98, 203, 49, 0.35)",
					fillOpacity: 0.35
				}],
				credits: {
					enabled: false
				},
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.subjects != undefined) {
			const categories_subject: any = [];
			const data_subject: any = [];
			this.classData.subjects.list.forEach((s: any, i: number) => {
				categories_subject.push(s.text_code);
				data_subject.push(s.value);
			});

			this.highchart_subject_mean.series = [{
				name: this.classData.subjects.value_type,
				data: data_subject,
				showInLegend: false
			}];
			this.highchart_subject_mean.xAxis.categories = categories_subject;
			this.highchart_subject_mean.yAxis.title.text = this.classData.subjects.value_type;
		}

		if (this.classData.current_class_grade_count_summary != undefined && this.classData.current_class_grade_count_summary.length > 0) {
			const categories_grades: any = [];
			const data_grades: any = [];

			this.classData.current_class_grade_count_summary.forEach((g: any, i: number) => {
				categories_grades.push(g.grade);
				data_grades.push(g.count);
			});
			this.highchart_students_per_grade.series = [{
				name: "Number of Students",
				data: data_grades,
				showInLegend: false
			}];
			this.highchart_students_per_grade.xAxis.categories = categories_grades;
		}

		if (this.classData.school_comparison != undefined) {
			if (this.classData.school_comparison.list != undefined) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.classData.school_comparison.min;
				this.timeseries_examgroup_max = this.classData.school_comparison.max;

				this.classData.school_comparison.list.forEach((sd: any, j: number) => {
					if (sd.value == undefined || sd.value == null || sd.value < 0) {
						sd.y = null;
					} else {
						sd.y = sd.value;
					}
				});
				this.timeseries_examgroup.push({
					name: "Stream Mean",
					colorByPoint: false,
					cursor: "pointer",
					marker: { symbol: "circle" },
					data: this.classData.school_comparison.list
				});
				// this.highchart_time_series.series = this.timeseries_examgroup;
				// this.highchart_time_series.yAxis.min = this.timeseries_examgroup_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examgroup_max;

				this.highchart_time_series = {
					chart: { type: "line", height: 400 },
					scrollbar: { enabled: true },
					credits: {
						enabled: false
					},
					title: { text: "" },
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
						max: this.timeseries_examgroup_max//gridLineColor: 'rgba(228, 229, 231, 0.60)'
					},
					series: this.timeseries_examgroup,
					exporting: {
						enabled: false
					}
				};
			}
		}
		if (this.fetchDataCount > 0) {
			// this.reAnimateViews();
		}
		this.fetchDataCount++;
		this.show_data = true;
	}
	change_selected_stream() {
		// console.log(this.selected_stream_value)
		// return;
		this.showReport = false;
		this.fetchContent(this.selected_stream_value, false, false);
	}
	change_selected_exam() {
		this.showReport = false;
		this.fetchContent(this.selected_stream.value, true, true);
	}
	//fetch stream data on tab click
	fetchContent(selected_stream?: any, grade_breakdown?: any, stream_comparison?: any) {
		const params = "";
		/*
     analyticsFactory.getStreamIntakeExamData(params).then(function (resp) {
     //  ////////console.log(resp);
     this.classData = resp;
     this.loadData();
     });*/

		let url = "/analytics/jointexam";
		if (selected_stream != undefined && selected_stream.indexOf("jointexam") == -1) {
			url += "?schoolid=" + selected_stream;
		}
		// console.log(url)
		// return
		this.hasError = false;
		if (this.loadingCount == 0) {
			this.isLoading = true;
		}
		this.jointService.doGet(url).subscribe(
			(res) => {
				// console.log(res)
				this.classData = res;
				this.isLoading = false;
				this.loadingCount++;
				this.loadData();
			},
			(err) => {
				console.log(err);
				this.hasError = true;
			}
		);
		// liteService.get(url).then(function (resp) {
		//   this.classData = resp.data;
		//   this.loadData();
		// }).catch(function (error) {
		//   //////console.log(error);
		// });
	}



	viewPrintFormat() {
		this.show_top_students.subjects = false;
		this.selected_kcse_mean.item = null;
		this.showReport = true;
		this.printClassReport();
	}
	hidePrintFormat() {
		this.showReport = false;
	}
	printClassReport() {
		// $window.scrollTo(0, 0);
	}
	printPage(name) {
		alert();
		const innerContents = document.getElementById("printthis")?.innerHTML;
		//var allContent =
		// <link rel="stylesheet"
		//           href="../../../styles.scss">
		//       <link rel="stylesheet"
		//           href="../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css">
		//       <link rel="stylesheet" href="../../../assets/css/vendors_css.css
		const popupWinindow = window.open("", "_blank", "width=device-width");
		// popupWinindow?.document.open();
		popupWinindow?.document.write(`
    <!DOCTYPE html>
      <html>
        <head>
            <link rel="stylesheet" href="../../../../styles.scss">
          <link rel="stylesheet" href="../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="../../../../assets/css/vendors_css.css">
          <style>

          .print-text-white {
            color: rgba(0, 0, 0, 0) !important;
            text-shadow: 0 0 0 #fff;
        }

        table{
            text-transform: capitalize !important;
        }
        table th,table td{
            padding: 3px;
            font-size: 13pt;
          }
          </style>
            <script>window.onload= function () { window.print();window.close();   }
            </script>

        </head>
        <body>${innerContents}</body>
      </html>`);
		popupWinindow?.document.close();
	}

}
