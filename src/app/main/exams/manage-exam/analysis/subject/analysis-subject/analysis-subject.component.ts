import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import * as Highcharts from "highcharts";
import {Subject, Observable} from "rxjs";
import {Major} from "src/app/@core/models/major/major";
import {DataService} from "src/app/@core/shared/services/data/data.service";
import {SchoolTypeData} from "src/app/@core/models/school-type-data";
import {SchoolService} from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-analysis-subject",
	templateUrl: "./analysis-subject.component.html",
	styleUrls: ["./analysis-subject.component.scss"]
})
export class AnalysisSubjectComponent implements OnInit, OnDestroy {
	schoolTypeData$: Observable<SchoolTypeData> = this.dataService.schoolData;
	destroy$: Subject<boolean> = new Subject<boolean>();

	isHighcharts = typeof Highcharts === "object";
	selected_exam: any = "";
	majors: Major[] = [];

	HighchartTimeSeries: typeof Highcharts = Highcharts;
	highchart_time_series!: Highcharts.Options;

	HighchartStreams: typeof Highcharts = Highcharts;
	highchart_stream_comparison!: Highcharts.Options;

	pathParams: any;
	queryParams: any;
	classData: any = {};
	selected_major: any = "";
	selected_kcse_mean: any = {};
	selectedStream: any = {};
	timeseries_examseries: any[] = [];
	timeseries_examseries_min: any;
	timeseries_examseries_max: any;
	timeseries_examgroup: any[] = [];
	timeseries_examgroup_min: any;
	timeseries_examgroup_max: any;
	kcse_mean_time_series_exists = false;
	timeSeriesExamSeries_kcse: any[] = [];
	timeSeriesExamSeries_kcse_min!: number;
	timeSeriesExamSeries_kcse_max!: number;
	show_top_students: any = {};
	yAxis: any = {};
	streams: any;
	exams: any;
	grade_breakdown: any = {};
	highchart_subject_mean: any;
	highchart_students_per_grade: any;
	show_data!: boolean;
	selected_stream: any;
	fetchDataCount = 0;

	school_profile: any = {};
	school_type_data: any = {};
	isLoadingData = true;
	showReport = false;
	no_data = false;
	isMobileApp = this.dataService.getIsMobileApp();
	school_logo_path: any;
	streams_performances: any[] = [];
	guinea_graphData: any = null;

	constructor(
		private dataService: DataService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private router: Router,
		private schoolService: SchoolService,
	) {
	}

	ngOnInit(): void {
		this.pathParams = this.route.snapshot.params;
		this.selected_major = parseInt(this.pathParams?.major);
		this.loadSchoolProfile();
		this.loadSchoolProfileInfo();
		// this.fetchContent();
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	loadSchoolProfile() {
		this.dataService.schoolData.subscribe((res: any) => {
			this.school_type_data = res;
			if (this.school_type_data) {
				this.fetchContent();
			}
		});
	}


	loadSchoolProfileInfo() {
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			if (schoolInfo) {
				this.school_profile = schoolInfo;
				this.school_logo_path = (this.school_profile?.logo && this.school_profile?.logo?.length > 0)
					?
					this.school_profile.logo
					:this.school_logo_path = "../../../../assets/img/default-logo.png";
			}
		});
	}

	setDefaultMajor() {
		if (!this.selected_major) this.selected_major = this.majors[0].id;
	}



	loadData() {
		this.isLoadingData = false;
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
		if (this.classData.merit_summary_list != undefined && this.classData.merit_summary_list.length > 0) {
			this.grade_breakdown = {};
			this.grade_breakdown.current_item = this.classData.merit_summary_list[0];
		}

		if (this.classData.stream_comparison != undefined) {
			const majorLabel: any = [];
			const graphObject: any = [];
			// const streams_performances: any[] = [];
			this.classData.stream_comparison.list.forEach((sc: any) => {
				this.streams_performances.push({name: sc.stream_name, y: sc.value});

				/**This section only happens for guinea schools. */
				if (sc.majors) {
					majorLabel.push(sc.stream_name);
					sc.majors.forEach((major: any) => {
						graphObject.push({
							type: "column",
							name: major.major,
							data: [],
						});
					});
					sc.majors.forEach((major: any, j: number) => {
						const graphObj = graphObject[j];
						graphObj.type = "column";
						graphObj.name = major.major;
						graphObj.data = [...graphObj.data, ...[major.value]];
					});
				}
			});

			// alert("Welcome Home")
			this.guinea_graphData = {
				labels: majorLabel,
				graphData: graphObject,
			};

			// this.highchart_stream_comparison.yAxis.min = this.classData.stream_comparison.min;
			// this.highchart_stream_comparison.yAxis.max = this.classData.stream_comparison.max;
			// this.highchart_stream_comparison.series[0].data = streams_performances;

			this.highchart_stream_comparison = {
				chart: {
					height: 190
				},
				credits: {
					enabled: false
				},
				title: {text: ""},
				xAxis: {
					type: "category",
					tickmarkPlacement: "on",
					gridLineWidth: 1,
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: {textOverflow: "none"},
						autoRotation: [-45, -90]
					}
				},
				yAxis: {
					labels: {y: 5, x: -2},
					title: {text: "", align: "high"},
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					min: this.classData.stream_comparison.min,
					max: this.classData.stream_comparison.max,
				},
				series: [{
					name: this.translate.instant("exams.analysisSubject.streamMean"),
					pointPlacement: "on",
					data: this.streams_performances,
					type: "area",
					showInLegend: false,
					color: "rgba(98, 203, 49, 0.35)",
					fillOpacity: 0.35
				}],
				exporting: {
					enabled: false
				}
			};
		}

		if (this.classData.timeseries != undefined) {
			if (this.classData.timeseries.examseries != undefined) {
				this.timeseries_examseries = [];
				this.timeseries_examseries_min = this.classData.timeseries.examseries.min;
				this.timeseries_examseries_max = this.classData.timeseries.examseries.max;
				this.classData.timeseries.examseries.list.forEach(stream => {
					stream.data.forEach(sd => {
						if (sd.value == undefined || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});
					this.timeseries_examseries.push({
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						type: "line",
						marker: {symbol: "circle"},
						data: stream.data,
					});
				});
			}

			if (this.classData.timeseries.examgroup != undefined) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.classData.timeseries.examgroup.min;
				this.timeseries_examgroup_max = this.classData.timeseries.examgroup.max;
				this.classData.timeseries.examgroup.list.forEach((stream) => {
					stream.data.forEach((sd) => {
						if (sd.value == undefined || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});

					this.timeseries_examgroup?.push({
						type: "line",
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						marker: {symbol: "circle"},
						data: stream.data,
					});
				});
			}

			if (this.classData.timeseries.annualEgroup != undefined) {
				this.timeseries_examgroup = [];
				this.classData.timeseries.annualEgroup.list.forEach((stream) => {
					stream.data.forEach((sd) => {
						if (sd.value == undefined || sd.value < 0) {
							sd.y = null;
						} else {
							sd.y = sd.value;
						}
					});

					this.timeseries_examgroup?.push({
						type: "line",
						name: stream.streamname,
						colorByPoint: false,
						cursor: "pointer",
						marker: {symbol: "circle"},
						data: stream.data,
					});
				});
			}

			if (this.classData.examtype == 1) {
				// this.highchart_time_series.series = this.timeseries_examseries;
				// this.highchart_time_series.yAxis.min = this.timeseries_examseries_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examseries_max;

				this.highchart_time_series = {
					title: {text: ""},
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: {textOverflow: "none"},
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {text: "", align: "high"},
						min: this.timeseries_examseries_min,
						max: this.timeseries_examseries_max
						//,gridLineColor: 'rgba(228, 229, 231, 0.60)'
					},
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
							// pointStart: 2010
						}
					},
					series: this.timeseries_examseries,
					chart: {height: 400},
				};
			} else if (this.classData.examtype == 2) {
				// this.highchart_time_series.series = this.timeseries_examgroup;
				// this.highchart_time_series.yAxis.min = this.timeseries_examgroup_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examgroup_max;

				this.highchart_time_series = {
					title: {text: ""},
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: {textOverflow: "none"},
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {text: "", align: "high"},
						min: this.timeseries_examgroup_min,
						max: this.timeseries_examgroup_max
					},
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
						}
					},
					series: this.timeseries_examgroup,
					chart: {height: 400},
				};
			} else if (this.classData.examtype == 3) {
				// this.highchart_time_series.series = this.timeseries_examgroup;
				// this.highchart_time_series.yAxis.min = this.timeseries_examgroup_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examgroup_max;

				this.highchart_time_series = {
					title: {text: ""},
					credits: {
						enabled: false
					},
					xAxis: {
						type: "category",
						tickmarkPlacement: "on",
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: {textOverflow: "none"},
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						title: {text: "", align: "high"},
						min: this.classData.timeseries.annualEgroup.min,
						max: this.classData.timeseries.annualEgroup.max
					},
					plotOptions: {
						series: {
							label: {
								connectorAllowed: false
							},
						}
					},
					series: this.timeseries_examgroup,
					chart: {height: 400},
				};
			}
		}
		this.fetchDataCount++;
		this.show_data = true;
	}

	getAllStudents() {
		let seriesid: any = -1;
		let egroupid: any = -1;
		let subjectid: any = -1;
		let intakeid: any = -1;
		let classid: any = -1;
		if (this.classData?.seriesid && this.classData.seriesid > 0) {
			seriesid = this.classData.seriesid;
		}
		if (this.classData?.egroupid && this.classData.egroupid > 0) {
			egroupid = this.classData.egroupid;
		}
		if (this.classData?.subjectid && this.classData.subjectid > 0) {
			subjectid = this.classData.subjectid;
		}
		if (this.classData?.intakeid && this.classData.intakeid > 0) {
			intakeid = this.classData.intakeid;
		}
		if (this.classData?.classid && this.classData.classid > 0) {
			classid = this.classData.classid;
		}

		const url = `/main/exams/manage/analysis/subject/merit-list/${seriesid}/${egroupid}/${subjectid}/${intakeid}/${classid}`;
		this.router.navigate([url]);
	}

	onKcseMeanChange() {
		this.classData.subjects.list.forEach((sb: any) => {
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

	change_selected_stream(selected_stream?: any) {
		if (selected_stream) this.selected_stream = selected_stream;
		// this.fetchContent(this.selected_stream.value, false, false);
		this.fetchContent();
	}

	change_selected_exam(selected_exam?: any) {
		if (selected_exam) this.selected_exam = selected_exam;
		// this.fetchContent(this.selected_stream.value, true, true);
		this.fetchContent();
	}

	change_selected_major(selected_major: any) {
		this.selected_major = selected_major;
		// this.fetchContent(this.selected_stream.value, true, true);
		this.fetchContent();
	}

	// fetchContent(selected_stream?: any, grade_breakdown?: any, stream_comparison?: any) {
	fetchContent() {
		let params = "";
		if (this.fetchDataCount == 0) {
			if (this.pathParams.classid > 0) {
				params = "?classid=" + this.pathParams.classid;
			} else if (this.pathParams.intakeid > 0) {
				params =
					"?intakeid=" +
					this.pathParams.intakeid +
					"&subjectid=" +
					this.pathParams.subjectid;
			}

			if (this.pathParams.seriesid > 0) {
				params += "&seriesid=" + this.pathParams.seriesid;
			} else if (this.pathParams.egroupid > 0) {
				params += "&egroupid=" + this.pathParams.egroupid;
			} else if (
				this.pathParams?.annual_egroup_id &&
				this.pathParams.annual_egroup_id > 0
			) {
				params += "&annualEgroupid=" + this.pathParams.annual_egroup_id;
			}
			if (
				this.pathParams.major &&
				this.pathParams.major > 0
			) {
				params += "&majorid=" + this.pathParams.major;
			}
		} else {
			if (
				this.selected_stream?.classid &&
				this.selected_stream.classid > 0
			) {
				params = "?classid=" + this.selected_stream.classid;
			} else if (
				this.selected_stream?.intakeid &&
				this.selected_stream.intakeid > 0
			) {
				params =
					"?intakeid=" +
					this.selected_stream.intakeid +
					"&subjectid=" +
					this.classData.subjectid;
			}

			if (
				this.selected_exam?.seriesid &&
				this.selected_exam?.seriesid > 0
			) {
				params += "&seriesid=" + this.selected_exam.seriesid;
			} else if (
				this.selected_exam?.egroupid &&
				this.selected_exam.egroupid > 0
			) {
				params += "&egroupid=" + this.selected_exam.egroupid;
			} else if (
				this.selected_exam?.annual_egroup_id &&
				this.selected_exam.annual_egroup_id > 0
			) {
				params += "&annualEgroupid=" + this.selected_exam.annualEgroupid;
			}
			if (
				this.selected_major &&
				this.selected_major > 0
			) {
				params += "&majorid=" + this.selected_major;
			}
		}

		this.isLoadingData = true;
		this.dataService.get("analytics/subject" + params).subscribe({
			next: (resp: any) => {
				this.classData = resp;
				this.majors = (resp && resp?.exam_majors) ? resp.exam_majors : [];

				const setDefaultMajor = this.school_type_data?.isGuineaSchool || this.school_type_data?.isIvorianSchool;
				if (setDefaultMajor) this.setDefaultMajor();
				this.no_data = false;
				this.loadData();
			},
			error: () => {
				this.no_data = true;
				this.isLoadingData = false;
			},
		});
	}

	stateparams: any = {};

	viewPrintFormat() {
		this.show_top_students.subjects = false;
		this.stateparams = {
			classid: this.classData?.classid,
			examid: this.classData?.examid,
			seriesid: this.classData?.seriesid
		};
		this.showReport = true;
	}

	hidePrintFormat() {
		this.showReport = false;
	}

	printPage2(printSectionId: string) {
		const innerContents = document.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width, initial-scale=1.0");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"../../../../styles.scss\"><link rel=\"stylesheet\" href=\"../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css\"><link rel=\"stylesheet\" href=\"../../../../assets/css/vendors_css.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
		// setTimeout(function () {
		//   popupWinindow?.print();
		// }, 500);
	}
}
