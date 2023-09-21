import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as Highcharts from "highcharts";
import { Options } from "highcharts";
import exporting from "highcharts/modules/exporting";

import { DataService } from "src/app/@core/shared/services/data/data.service";
import { environment } from "src/environments/environment";
import * as XLSX from "xlsx";
import { Observable, Subscription } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DateTimeAdapter, OwlDateTimeIntl } from "@danielmoncada/angular-datetime-picker";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { ReportFormService } from "src/app/@core/services/printouts/report-forms/report-form.service";
import { ReportForms } from "src/app/@core/models/printouts/report-forms/report-forms";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-tz-report-forms",
	templateUrl: "./tz-report-forms.component.html",
	styleUrls: ["./tz-report-forms.component.scss"]
})
export class TzReportFormsComponent implements OnInit, OnDestroy {
	dateNow = new Date();
	behaviours: any[] = [ // primary
		{
			id: 1,
			description: "Respect",
			grade: ""
		},
		{
			id: 2,
			description: "Kindness",
			grade: ""
		},
		{
			id: 3,
			description: "Responsibility",
			grade: ""
		},
		{
			id: 4,
			description: "Honesty",
			grade: ""
		},
		{
			id: 5,
			description: "Teamwork",
			grade: ""
		},
	];



	exams: any = {};
	selected: any = {};
	stateparams: { userid: number, intakeid: number, streamid: number, subjectid: number, seriesid: number, egroupid: number } = { userid: 0, intakeid: 0, streamid: 0, subjectid: 0, seriesid: 0, egroupid: 0 };
	topBar: any = {};
	fetching_examsData_inprogress = false;
	fetching_examsList_inprogress = false;
	no_exams_msg = "";
	finally: any = {};
	report_displayed = false;

	image_root = "";
	avatar_url = "";

	school_profile: any;
	recentPerf: any;
	itemsFound = false;
	no_data = true;
	feeData: any = {};

	isFileSelected = false;
	feeData_Temp: any;

	option_signatures: any;

	show_classteachers_comments = true;
	show_houseteachers_comments = true;
	show_classteachers_signature = true;
	show_houseteachers_signature = true;
	show_student_overall_rank = true;
	show_student_stream_rank = true;
	show_principal_comments = true;
	show_deputy_hm_academic_comments = true;
	show_principal_signature = true;
	show_parent_signature = false;
	show_deputy_hm_academic_signature = true;

	schoolTypeData: any;

	/**Get user roles from subject */
	user_roles$: Observable<Role> = this.rolesService.roleSubject;

	isMobileApp = false;

	closingDate: any;
	openingDate: any;
	reportingTime?: string;
	results_file: any;
	show_custom_comments = false;
	school_logo_path: any;

	isPrinting = false;
	paramsPresent = false;

	isHighcharts = typeof Highcharts === "object";

	Highcharts: typeof Highcharts = Highcharts;
	highchart_subject_comparison: Options = {
		credits: { enabled: false },
		chart: {
			height: 250
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
			title: { text: "", align: "high" },
			gridLineColor: "rgba(228, 229, 231, 0.60)"
		},
		xAxis: {
			type: "category",
			tickmarkPlacement: "on",
			gridLineWidth: 1,
			gridLineColor: "rgba(228, 229, 231, 0.60)",
			labels: {
				style: { textOverflow: "none" }
			}
		},
		series: [{
			name: "",
			pointPlacement: "on",
			data: [],
			type: "line",
			showInLegend: true,
			color: "#43ab49",
			zIndex: 2
		}, {
			name: "",
			pointPlacement: "on",
			data: [],
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

	Highcharts_studPot: typeof Highcharts = Highcharts;
	highcharts_time_series: Highcharts.Options = {
		credits: { enabled: false },
		chart: {
			height: 280
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
			}
		},
		yAxis: {
			title: { text: "", align: "high" }
		},
		series: [{
			name: this.translate.instant("common.examMean"),
			colorByPoint: false,
			cursor: "pointer",
			showInLegend: false,
			data: [],
			type: "column",
		}],
	};
	isDownloading = true;
	id!: NodeJS.Timeout;
	isCompleteRenderReportform = false;

	languageChangeSub!: Subscription;
	reportForms!: ReportForms;

	constructor(
		private dataService: DataService,
		private rolesService: RolesService,
		private studentsService: StudentsService,
		private activatedRoute: ActivatedRoute,
		private translate: TranslateService,
		private siteLanguageService: SiteLanguageService,
		private owlDateTimeIntl: OwlDateTimeIntl,
		private owlDateTimeAdapter: DateTimeAdapter<any>,
		private reportFormsService: ReportFormService,
		private schoolService: SchoolService,
	) {
		exporting(Highcharts);
	}

	ngOnInit(): void {
		this.changeOwlDatetimeLocale(null);

		this.languageChangeSub = this.translate.onLangChange.subscribe((languageChangeEvent) => {
			this.changeOwlDatetimeLocale(languageChangeEvent);
		});

		this.initOptionSignatures();
		this.getSchoolProfile();
		this.selected.intake = {};
		this.selected.stream = {};
		this.selected.exam = {};
		this.selected.subject = {};
		this.activatedRoute.params.subscribe(param => {
			// //console.warn("rforms params>> ", param);
			if (param.userid || param.streamid || param.seriesid || param.egroupid) {
				// //console.warn("rforms params 1>> ", param);
				this.paramsPresent = true;
				this.stateparams.userid = param.userid;
				this.stateparams.streamid = param.streamid;
				this.stateparams.seriesid = param.seriesid;
				this.stateparams.egroupid = param.egroupid;
				this.stateparams.intakeid = param.intakeid;
				this.recentPerformance();
			}
			if (param.intakeid) {
				this.getSchoolTypeData(true);
			} else {
				this.getSchoolTypeData();
			}
		});
		this.topBar.IsCollapsed = false;

		this.finally.show = false;
		this.report_displayed = false;

		this.isMobileApp = this.dataService.getIsMobileApp();

	}

	ngOnDestroy(): void {
		this.languageChangeSub?.unsubscribe();
	}

	changeOwlDatetimeLocale(languageChangeEvent: any | null): void {
		const currentSiteLangauge = this.siteLanguageService.getCurrentLanguage();

		// english
		if (currentSiteLangauge?.code === "en") {
			/* owl date-time picker */
			this.owlDateTimeAdapter.setLocale("en-gb");
			this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
			this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");

			return;
		}

		/* on language change */
		if (languageChangeEvent) {
			/* owl date-time picker */
			this.owlDateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
			this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
			this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
		}

		/* owl date-time picker */
		this.owlDateTimeAdapter.setLocale(currentSiteLangauge?.code as string);
		this.owlDateTimeIntl.cancelBtnLabel = this.translate.instant("common.owlDateTime.cancelBtnLabel");
		this.owlDateTimeIntl.setBtnLabel = this.translate.instant("common.owlDateTime.setBtnLabel");
	}

	translateAggregateStatsText(name: string): string {
		switch (name) {
		case "Total Marks":
			return this.translate.instant("common.totalMarks");

		case "Mean Marks":
			return this.translate.instant("common.meanMarks");

		case "Total Points":
			return this.translate.instant("common.totalPoints");

		case "Overall Position":
			return this.translate.instant("common.overallPosition");

		case "Stream Position":
			return this.translate.instant("common.streamPosition");

		case "Mean Grade":
			return this.translate.instant("common.meanGrade");

		default:
			return name;
		}
	}

	scrollList: any[] = [];
	scrollListLimit = 10;
	scrollListIndex = 0;
	onScrollDown() {
		console.log("scrolled down!!");
		this.appendItems();
	}

	trackByFn(index, item) {
		return item.admno; // unique id corresponding to the item
	}
	trackByFnSubjects(index, item) {
		return item.subjectid; // unique id corresponding to the item
	}

	appendItems() {
		const arrayWithItems = this.recentPerf.list;
		const arrayPart: any[] = arrayWithItems.slice(this.scrollListIndex, this.scrollListLimit);

		this.scrollList.join();
		this.scrollList = this.scrollList.concat(arrayPart);
		this.scrollListIndex += this.scrollListLimit;
		this.scrollListLimit += this.scrollListLimit;
	}

	invalidateStreams() {
		this.selected.stream = {};
		if (this.selected.intake == null) {
			this.exams = [];
		}
	}

	fetchIntakeStreamExams(intake: any, stream: any, seriesid?: any, egroupid?: any) {
		let params = "";
		let has_state_params = false;
		let has_selected_exam = false;
		if ((seriesid != null && seriesid > 0) || (egroupid != null && egroupid.length > 0)) {
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


			this.studentsService.getStreamIntakeExamData(params, true).subscribe((response: any) => {

				this.fetching_examsList_inprogress = false;
				this.itemsFound = false;
				if (response.exams == null || response.exams.length == 0) {
					this.exams = [];
					this.no_exams_msg = "No Exams Found";
				} else {
					this.exams = response.exams.reverse();
					if (has_state_params || has_selected_exam) {
						this.exams.forEach((exam: any) => {
							if (seriesid > 0 && exam.seriesid != null && exam.seriesid == seriesid) {
								this.selected.exam = exam;
							} else if (egroupid > 0 && exam.egroupid != null && exam.egroupid == egroupid) {
								this.selected.exam = exam;
							}
						});
					}
				}
			});
		}
	}

	getStudentReportForms() {
		this.paramsPresent = false;
		this.scrollList = [];
		this.finally.show = false;
		let seriesid = 0;
		let egroupid = 0;
		let streamid = 0;
		if (this.selected.stream && this.selected.stream.streamid != undefined && this.selected.stream.streamid > 0) {
			streamid = this.selected.stream.streamid;
		}

		if (this.selected.exam) {
			if (this.selected.exam.seriesid && this.selected.exam.seriesid > 0) {
				seriesid = this.selected.exam.seriesid;
			} else if (this.selected.exam.egroupid  && this.selected.exam.egroupid > 0) {
				egroupid = this.selected.exam.egroupid;
			}
		}

		let show_loader = true;
		if (this.stateparams.streamid > 0 && this.stateparams.streamid == streamid && ((this.stateparams.seriesid > 0 && this.stateparams.seriesid == seriesid) || (this.stateparams.egroupid > 0 && this.stateparams.egroupid == egroupid))) {
			show_loader = false;
		}

		if (show_loader) {
			this.fetching_examsData_inprogress = true;
		}

		this.stateparams.streamid = streamid;
		this.stateparams.seriesid = seriesid;
		this.stateparams.egroupid = egroupid;

		this.recentPerformance();
	}

	recentPerformance() {
		const userid = this.stateparams.userid;
		const streamid = this.stateparams.streamid;
		const seriesid = this.stateparams.seriesid;
		const egroupid = this.stateparams.egroupid;

		let q_params = "?ts=true&report=true";
		if (streamid > 0) {
			q_params += "&streamid=" + streamid;
		} else if (userid > 0) {
			q_params += "&userid=" + userid;
		}

		if (seriesid > 0) {
			q_params += "&seriesid=" + seriesid;
		} else if (egroupid > 0) {
			q_params += "&egroupid=" + egroupid;
		}

		this.image_root = environment.apiurl + "/groups/images/";
		this.avatar_url = "../../../../assets/img/avatar/p_avatar_blue.png";

		this.reportFormsService.getReportForms(q_params).subscribe((reportForms) => {
			console.log("reportForms", reportForms);
			this.reportForms = reportForms;
		});

		this.dataService.get("analytics/student" + q_params).subscribe((resp: any) => {
			// //console.warn('analytics/student >> ', resp);
			if (resp.list !== undefined && resp.list.length > 0) {
				resp.list.forEach((rp: any) => {
					let image_path = this.getUserImage(null);
					if (rp.url != null && rp.url.length > 0) {
						image_path = this.getUserImage(rp.url);
					}
					rp.image_path = image_path;

					/**'rp.classteacher.signature' is assigned to itself.eslintno-self-assign */
					if (rp.classteacher && rp.classteacher?.signature) {
						rp.classteacher.signature = rp.classteacher.signature;
					}

					rp.highchart_subject_comparison = this.highchart_subject_comparison;
					rp.highcharts_time_series = this.highcharts_time_series;
					rp.highchart_subject_comparison.yAxis.min = rp.subject_comparison.min;
					rp.highchart_subject_comparison.yAxis.max = rp.subject_comparison.max;
					rp.highchart_subject_comparison.series[0].name = rp.subject_comparison.name_student;
					rp.subject_comparison.list_student.forEach((exam: any) => {
						if (!exam.value || exam.value < 0) {
							exam.y = null;
						} else {
							exam.y = exam.value;
						}
					});
					rp.highchart_subject_comparison.series[0].data = rp.subject_comparison.list_student;
					rp.highchart_subject_comparison.series[1].name = rp.subject_comparison.name_class;
					rp.subject_comparison.list_class.forEach((exam: any) => {
						if (!exam.value || exam.value < 0) {
							exam.y = null;
						} else {
							exam.y = exam.value;
						}
					});
					rp.highchart_subject_comparison.series[1].data = rp.subject_comparison.list_class;

					rp.highchart_subject_comparison = {
						credits: { enabled: false },
						chart: {
							height: 250,
							animation: false
						},
						boost: {
							enabled: true,
							seriesThreshold: 50,
							useGPUTranslations: false,
							usePreallocated: false
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
							title: { text: "", align: "high" },
							gridLineColor: "rgba(228, 229, 231, 0.60)",
							min: rp.subject_comparison.min,
							max: rp.subject_comparison.max,
						},
						xAxis: {
							type: "category",
							tickmarkPlacement: "on",
							gridLineWidth: 1,
							gridLineColor: "rgba(228, 229, 231, 0.60)",
							labels: {
								style: { textOverflow: "none" }
							}
						},
						series: [{
							name: rp.subject_comparison.name_student,
							pointPlacement: "on",
							data: rp.subject_comparison.list_student,
							type: "line",
							showInLegend: true,
							color: "#43ab49",
							animation: false,
							marker: {
								symbol: "circle"
							},
							zIndex: 2
						}, {
							name: rp.subject_comparison.name_class,
							pointPlacement: "on",
							data: rp.subject_comparison.list_class,
							type: "area",
							showInLegend: true,
							color: {
								linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
								stops: [
									[0, "#C0C0C0"], // start
									// [0.5, '#3366AA'], // middle
									// [1, '#ffffff'] // end
								]
							},
							marker: {
								symbol: "circle"
							},
							zIndex: 1,
							animation: false
						}],
						exporting: {
							enabled: false
						}
					};

					rp.highchart_subject_stud_comparison = {
						credits: { enabled: false },
						chart: {
							height: 200,
							animation: false
						},
						boost: {
							enabled: true,
							seriesThreshold: 50,
							useGPUTranslations: false,
							usePreallocated: false
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
							title: { text: "", align: "high" },
							gridLineColor: "rgba(228, 229, 231, 0.60)",
							min: rp.subject_comparison.min,
							max: rp.subject_comparison.max,
						},
						xAxis: {
							type: "category",
							tickmarkPlacement: "on",
							gridLineWidth: 1,
							gridLineColor: "rgba(228, 229, 231, 0.60)",
							labels: {
								style: { textOverflow: "none" }
							}
						},
						series: [{
							name: rp.subject_comparison.name_student,
							pointPlacement: "on",
							data: rp.subject_comparison.list_student,
							type: "line",
							showInLegend: true,
							color: "#43ab49",
							animation: false,
							marker: {
								symbol: "circle"
							},
							zIndex: 2
						}, {
							name: rp.subject_comparison.name_class,
							pointPlacement: "on",
							data: rp.subject_comparison.list_class,
							type: "area",
							showInLegend: true,
							color: {
								linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
								stops: [
									[0, "#C0C0C0"],
								]
							},
							marker: {
								symbol: "circle"
							},
							zIndex: 1,
							animation: false
						}],
						exporting: {
							enabled: false
						}
					};

					rp.timeseries.examscombined.list.forEach((exam: any) => {
						if (!exam.value || exam.value < 0) {
							exam.y = null;
						} else {
							exam.y = exam.value;
						}
					});
					rp.highcharts_time_series.series[0].data = rp.timeseries.examscombined.list;
					rp.highcharts_time_series.yAxis.min = rp.timeseries.examscombined.min;
					rp.highcharts_time_series.yAxis.max = rp.timeseries.examscombined.max;

					rp.highcharts_time_stud_series = {
						credits: { enabled: false },
						chart: {
							height: 280,
							animation: false
						},
						boost: {
							enabled: true,
							seriesThreshold: 50,
							useGPUTranslations: false,
							usePreallocated: false
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
							}
						},
						yAxis: {
							title: { text: "", align: "high" },
							min: rp.timeseries.examscombined.min,
							max: rp.timeseries.examscombined.max,
						},
						series: [{
							name: this.translate.instant("common.examMean"),
							colorByPoint: false,
							cursor: "pointer",
							showInLegend: false,
							data: rp.timeseries.examscombined.list,
							type: "column",
							animation: false
						}],
					};
				});


			}
			this.recentPerf = resp;
			// this.appendItems();
			this.isCompleteRenderReportform = false;
			this.completeInterval();
			this.controller();
			return resp;
		});
	}

	completeInterval() {
		const length = this.recentPerf.list.length;
		const divisions = (length / this.scrollListLimit);// + Math.ceil(length/this.scrollListLimit);
		let limiter = 0;
		//console.log(divisions);
		this.id = setInterval(() => {
			console.log(limiter);
			if (limiter >= divisions) {
				if (this.id) {
					clearInterval(this.id);
					console.log("Done!");
					this.isCompleteRenderReportform = true;
				}
			}
			limiter++;
		},100);
	}

	getUserImage(image_path: any) {
		if (image_path === undefined || image_path === null) {
			return this.avatar_url;
		} else if (image_path.includes("http") || image_path.includes(this.avatar_url)) {
			return image_path;
		} else {
			image_path = this.image_root + image_path;
			return image_path;
		}
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe(resp => {
			//////console.warn('getSchoolProfile() >> ', resp);
			this.school_profile = resp;
			this.setUpSignaturesOnSchoolLoad();

		});
	}

	initOptionSignatures() {
		this.option_signatures = {
			principal: {
				hasLogo: false,
				logoUrl: null
			}, cteacher: {
				hasLogo: false,
				logoUrl: null
			}
		};
	}

	setUpSignaturesOnSchoolLoad() {
		if (this.school_profile?.logo !== undefined && this.school_profile?.logo !== null) {
			this.school_logo_path = this.school_profile?.logo;
		} else {
			this.school_logo_path = "../../../../assets/img/default-logo.png";
		}
	}

	controller() {
		if (this.recentPerf !== undefined && this.recentPerf.list !== undefined && this.recentPerf.list.length > 0) {
			this.no_data = false;
		} else {
			this.no_data = true;
		}
		this.itemsFound = true;


		if (this.recentPerf.list.length > 0) {
			if (this.recentPerf.list[0].classteacher.signature !== undefined
				&& this.recentPerf.list[0].classteacher.signature !== null) {
				this.option_signatures.cteacher.logoUrl = this.recentPerf.list[0].classteacher.signature;
				const image = new Image();
				image.crossOrigin = "anonymous";
				image.src = this.option_signatures.cteacher.logoUrl + "?cacheblock=true";
				//console.warn("this.option_signatures.cteacher.logoUrl >> ", this.option_signatures.cteacher.logoUrl);
				image.onload = () => {
					// image exists and is loaded
					this.option_signatures.cteacher.hasLogo = true;
				};
				image.onerror = () => {
					// image did not load
					this.option_signatures.cteacher.hasLogo = false;
				};
			} else {
				this.option_signatures.cteacher.hasLogo = false;
			}
		}

		const intervalId = setInterval(() => {
			this.finally.show = true;
			if (this.finally.show) {
				this.topBar.IsCollapsed = true;
				this.fetching_examsData_inprogress = false;
				clearInterval(intervalId);
			}
		}, 1000);

	}

	downloadTemplate() {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "termBalance" },
			{ key: "nextTermFees" },
		];

		// translations
		const fileName = this.translate.instant("printouts.reportForms.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("printouts.reportForms.excelTemplateDownload.workSheetName");

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`printouts.reportForms.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		// const data_template = ["ADMNO", "NAME", "TERM_BALANCE", "NEXT_TERM_FEES"];
		const data_template = [...columns];
		// this.dataService.downloadExcelTemplate(data_template, "Student Fees - Template");
		this.dataService.downloadExcelTemplate(data_template, fileName, workSheetName);
	}

	getCleanedNumber(value: any) {
		value = String(value);
		if (value !== undefined && value !== null) {
			value = value.replace(/\s/g, "");
			value = value.replace(/[^\d.-]/gi, "").trim();
		}
		value = Number(value);
		if (value == null || isNaN(value)) {
			value = 0;
		}
		return value;
	}

	detectFiles(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		target.files.length == 1 ? this.isFileSelected = true : this.isFileSelected = false;
		if (target.files.length !== 1) throw new Error("Cannot use multiple files");
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
			const ab: ArrayBuffer = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(ab);

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			this.feeData_Temp = XLSX.utils.sheet_to_json(ws);
			// this.sheet_headers = this.data[0];

			// this.feeData_Temp.splice(0,1);
			this.feeData = {};

			this.feeData_Temp.forEach((dt: any) => {
				this.feeData[dt.ADMNO] = {};
				this.feeData[dt.ADMNO]["TERM_BALANCE"] = this.getCleanedNumber(dt.TERM_BALANCE);
				this.feeData[dt.ADMNO]["NEXT_TERM_FEES"] = this.getCleanedNumber(dt.NEXT_TERM_FEES);
			});
		};

		reader.readAsArrayBuffer(target.files[0]);
	}

	getSchoolTypeData(hasIntake?: boolean) {
		this.dataService.schoolData.subscribe(val => {
			this.schoolTypeData = val;
			if (hasIntake && this.schoolTypeData) {
				this.selected.intake = this.schoolTypeData?.current_forms_list.find(({ intakeid }) => intakeid == this.stateparams.intakeid);
				this.selected.stream = this.selected.intake?.streams.find(({ streamid }) => streamid == this.stateparams.streamid);
				this.fetchIntakeStreamExams(this.selected.intake, null, this.stateparams.seriesid);
			}
		});
	}

	setClosingDate(date: string) {
		this.closingDate = moment(date).format("yyyy-MM-DD");
	}

	setOpeningDate(date: string) {
		this.openingDate = moment(date).format("yyyy-MM-DD");
	}

	setReportingTime(time: string) {
		this.reportingTime = moment(time).format("h:mm:ss a");
	}

	get isTzPrimary(): boolean {
		return this.schoolTypeData.isTanzaniaPrimary;
	}

	get isTzSecondary(): boolean {
		return this.schoolTypeData.isTanzaniaSecondary;
	}

}
