import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as Highcharts from "highcharts";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { SchoolInfo } from "../../../@core/models/school-info";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subscription } from "rxjs";
import { CommonTranslationsService } from "src/app/@core/shared/services/common-translations.service";
import { FormControl } from "@angular/forms";
import { APIStatus } from "src/app/@core/enums/api-status";
import { ExamItems } from "src/app/@core/models/exams/exam-dropdown-items";
import NotesCategoryState from "src/app/@core/services/student/notes/notes-category.state";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import { BannerService } from "src/app/@core/services/banner/banner.service";
import { Banner } from "src/app/@core/models/banners/banner";
import { OwlOptions } from "ngx-owl-carousel-o";

@Component({
	selector: "app-student-analytics",
	templateUrl: "./student-analytics.component.html",
	styleUrls: ["./student-analytics.component.scss"]
})
export class StudentAnalyticsComponent implements OnInit, OnDestroy {
	selectedExam = new FormControl("");
	headervisibility: any = {};
	header_main = undefined;
	recentPerformance: any = {};
	no_data = true;
	routeId: any;
	animateCount = 0;
	student_fees: any;
	image_path: any;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	school_profile!: SchoolInfo;
	exams: any[] = [];
	timeseries_examseries: any[] = [];
	timeseries_examseries_min?: number;
	timeseries_examseries_max?: number;
	timeseries_examgroup: any[] = [];
	timeseries_examgroup_min?: number;
	timeseries_examgroup_max?: number;
	isLoading = false;

	items = ["Overall", "Maths", "Chemistry"];

	private examMean = this.translate.instant("common.examMean");
	private streamMean = this.translate.instant("common.streamMean");

	isHighcharts = typeof Highcharts === "object";

	Highcharts: typeof Highcharts = Highcharts;
	highchart_subject_comparison: Highcharts.Options = {
		chart: {
			height: 340
		},
		title: {
			text: ""
		},
		legend: { enabled: false },
		yAxis: {
			// lineWidth: 1,
			title: {
				text: ""
			}
		},
		series: [{
			zIndex: 1,
			data: [],
			type: "area",
			pointPlacement: "on",
			name: this.streamMean,
			color: "rgb(98, 203, 49)",
		}, {
			name: "",
			pointPlacement: "on",
			data: [],
			type: "line",
			showInLegend: true,
			color: "rgb(98, 203, 49)",
			marker: { symbol: "circle" },
			zIndex: 2
		}
		],
		credits: {
			enabled: false
		}
	};

	HighchartStreams: typeof Highcharts = Highcharts;
	highchart_time_series: Highcharts.Options = {
		chart: {
			type: "line"
		},
		title: {
			text: ""
		},
		credits: {
			enabled: false
		},
		series: [{
			name: this.examMean,
			type: "line",
			cursor: "pointer",
			showInLegend: false,
			data: []
		}],
		exporting: { enabled: true }
	};
	schoolTypeData!: SchoolTypeData;

	languageChangeSub!: Subscription;
	notesCategoriesSub!: Subscription;

	readonly APIStatus = APIStatus;

	notesCategoriesStatus$: Observable<APIStatus> = this.notesCategoryState.notesCategoriesStatus$;
	notesCategories$: Observable<string[] | null> = this.notesCategoryState.notesCategories$;
	banners: Array<Banner> = [];

	carouselOptions: OwlOptions = {
		loop: true,
		autoplay: true,
		autoplaySpeed: 1000,
		mouseDrag: false,
		touchDrag: false,
		pullDrag: false,
		dots: false,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
		},
	};

	constructor(
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private rolesService: RolesService,
		private schoolService: SchoolService,
		private notesCategoryState: NotesCategoryState,
		private translate: TranslateService,
		private commonTranslationsService: CommonTranslationsService,
		private bannerService: BannerService
	) {
		this.schoolService.schoolInfo.subscribe((school_profile) => {
			this.school_profile = school_profile;
		});
	}

	ngOnDestroy(): void {
		this.languageChangeSub?.unsubscribe();
		this.notesCategoriesSub?.unsubscribe();
	}

	ngOnInit(): void {
		this.examChangeListerner();
		this.activatedRoute.params.subscribe(params => {
			// console.warn("params >> ", params);
			this.routeId = params.id;
			this.dataService.schoolData.subscribe((schoolTypeData) => {
				this.schoolTypeData = schoolTypeData;
				if (this.schoolTypeData && !this.schoolTypeData.isOLevelSchool) {
					this.fetchContent(true);
				}
			});
		});
		// console.warn("Snapshot2 >> ", this.routeId);
		this.initStickyHeader();
		// this.getBarColor();

		this.languageChangeSub = this.translate.onLangChange.subscribe((languageChangeEvent) => {
			/* Subject Comparison List Student Translations */
			this.translateSubjectComparisonListStudent();

			/* Subject Comparison List Class Translations */
			this.translateSubjectComparisonListClass();

			/*  */
			this.translateTimeSeriesExamGroupList();

			/* Highcharts Translations */ // TODO: extract to its own method
			this.examMean = this.translate.instant("common.examMean");
			this.streamMean = this.translate.instant("common.streamMean");

			if (this.highchart_time_series.series) {
				// TODO: refactor to extract common/constant chart options to avoid unnecessary code repetition
				this.highchart_time_series = {
					chart: {
						type: "line",
						height: 350
					},
					scrollbar: { enabled: true },
					plotOptions: {
						series: { animation: true },
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
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						max: this.timeseries_examgroup_max,
						min: this.timeseries_examgroup_min,
						lineWidth: 1,
						title: {
							text: ""
						},
					},
					series: [{
						name: this.examMean,
						type: "line",
						cursor: "pointer",
						showInLegend: false,
						data: this.timeSeriesExamGroupList
					}],
					exporting: { enabled: true }
				};
			}

			if (this.highchart_subject_comparison.series) {
				// TODO: refactor to extract common/constant chart options to avoid unnecessary code repetition
				this.highchart_subject_comparison = {
					chart: {
						height: 340,
					},
					plotOptions: {
						series: { animation: true },

					},
					title: {
						text: ""
					},
					tooltip: { shared: true },
					legend: {
						layout: "horizontal",
						align: "right",
						verticalAlign: "top",
						floating: true,
						backgroundColor: "rgba(255, 255, 255, 0)"
					},
					credits: {
						enabled: false
					},
					yAxis: {
						labels: { y: 5, x: -2 },
						title: { text: "", align: "high" },
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						min: this.recentPerformance.subject_comparison.min,
						max: this.recentPerformance.subject_comparison.max,
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
					series: [
						{
							name: this.recentPerformance.subject_comparison.name_student,
							pointPlacement: "on",
							data: this.subjectComparisonListStudent,
							type: "line",
							showInLegend: true,
							color: "rgb(98, 203, 49)",
							marker: { symbol: "circle" },
							zIndex: 2
						},
						{
							name: this.translateFormName(this.recentPerformance.subject_comparison.name_class),
							zIndex: 1,
							data: this.subjectComparisonListClass,
							type: "area",
							pointPlacement: "on",
							showInLegend: true,
							color: "rgb(155, 155, 155)",
							marker: { symbol: "circle" },
						}
					],
				};
			}

			/* Subjects Translations */
			this.translateSubjects();

			/* Exam name Translations */
			if (this.recentPerformance) {
				this.translateExamName(this.recentPerformance.examname);
			}

			/* Class name Translations */
			this.translateCurrentClassName(this.recentPerformance.current_class_name);
		});

		this.getBanners();
	}

	private getBanners() {
		this.bannerService.getBanners().subscribe({
			next: (resp: any) => this.banners = resp,
			error: err => console.error("Banner error > ", err),
		});
	}

	examChangeListerner() {
		this.selectedExam.valueChanges.subscribe(resp => {
			this.fetchContent();
		});
	}

	compareExamsFunction(item: ExamItems, selected: ExamItems) {
		return item.examid === selected.examid;
	}

	translatedSubjects: any[] = [];
	translateSubjects() {
		const subjectNames = [...this.commonTranslationsService.subjects];
		// console.log("Subject Names:", subjectNames);

		const subjects = (this.recentPerformance.subjects.list as any[]).map(subjectItem => {
			const foundSubject = subjectNames.find(item => item.name === subjectItem.subject);
			// console.log("Found Subject:", foundSubject);

			if (foundSubject) {
				return { ...subjectItem, subject: foundSubject.value };
			}

			return subjectItem;
		});
		// console.log("Subjects:", subjects);
		this.translatedSubjects = [...subjects];
	}

	subjectComparisonListStudent: any[] = [];
	translateSubjectComparisonListStudent() {
		const subjectNames = [...this.commonTranslationsService.subjects];

		const listStudents = (this.recentPerformance.subject_comparison.list_student as any[]).map(listItem => {
			const foundSubject = subjectNames.find(item => item.name === listItem.name);
			// console.log("Found item:", foundSubject);

			if (foundSubject) {
				return { ...listItem, name: foundSubject.value };
			}

			return listItem;
		});

		// console.log(listStudents);
		this.subjectComparisonListStudent = [...listStudents];
	}

	subjectComparisonListClass: any[] = [];
	translateSubjectComparisonListClass() {
		const subjectNames = [...this.commonTranslationsService.subjects];

		const listClass = (this.recentPerformance.subject_comparison.list_class as any[]).map(listItem => {
			const foundSubject = subjectNames.find(item => item.name === listItem.name);
			// console.log("Found item:", foundSubject);

			if (foundSubject) {
				return { ...listItem, name: foundSubject.value };
			}

			return listItem;
		});

		// console.log(listClass);
		this.subjectComparisonListClass = [...listClass];
	}

	timeSeriesExamGroupList: any[] = [];
	translateTimeSeriesExamGroupList(): void {
		if (this.recentPerformance?.timeseries?.examgroup) {
			const translatedGroupList = (this.recentPerformance?.timeseries?.examgroup?.list as any[]).map(listItem => {
				const translatedName = this.translateExamName(listItem.name);
				return { ...listItem, name: translatedName };
			});
			this.timeSeriesExamGroupList = [...translatedGroupList];
		}
		// console.warn("timeSeriesExamGroupList >> ", this.timeSeriesExamGroupList);
	}

	translateAggregateText(name: string): string {
		switch (name) {
		case "Mean Marks":
			return this.translate.instant("students.analytics.meanMarks");

		case "Average Marks":
			return this.translate.instant("students.analytics.averageMarks");

		case "Total Points":
			return this.translate.instant("students.analytics.totalPoints");

		case "Overall Position":
			return this.translate.instant("students.analytics.overallPosition");

		case "Stream Position":
			return this.translate.instant("students.analytics.streamPosition");

		case "Mean Grade":
			return this.translate.instant("students.analytics.meanGrade");

		default:
			return name;
		}
	}

	translateSubjectsValueType(name: string): string {
		switch (name) {
		case "Marks":
			return this.translate.instant("common.marks");

		default:
			return name;
		}
	}

	translateExamName(rawExamName: string): string {
		// console.log(rawExamName);

		if (!rawExamName) return "";

		if (rawExamName === "KCPE Average") {
			return <string>this.translate.instant("common.kcpeAverage");
		}

		if (!rawExamName.includes("-")) {
			return rawExamName;
		}

		const nameSegments = rawExamName.split(" - ");

		const [form, currentExam, term] = nameSegments;

		/* Forms */
		const form1Translated = this.translate.instant("common.forms.form1");
		const form2Translated = this.translate.instant("common.forms.form2");
		const form3Translated = this.translate.instant("common.forms.form3");
		const form4Translated = this.translate.instant("common.forms.form4");

		let formTranslated = "";

		switch (form) {
		case "Form 1":
			formTranslated = form1Translated;
			break;
		case "Form 2":
			formTranslated = form2Translated;
			break;
		case "Form 3":
			formTranslated = form3Translated;
			break;
		case "Form 4":
			formTranslated = form4Translated;
			break;

		default:
			formTranslated = form;
			break;
		}

		/* Current Exam Name */
		const termAverageTranslated = this.translate.instant("common.termAverage");

		let currentExamTranslated = "";

		if (currentExam.toLowerCase() === "Term Average".toLowerCase()) {
			currentExamTranslated = termAverageTranslated;
		} else {
			currentExamTranslated = currentExam;
		}

		/* Term */
		const term1Translated = this.translate.instant("common.terms.term1");
		const term2Translated = this.translate.instant("common.terms.term2");
		const term3Translated = this.translate.instant("common.terms.term3");

		let termTranslated = "";
		const termYear = term.split(" ")[0]; // includes opening bracket

		if (term.includes("Term 1")) {
			termTranslated = `${termYear} ${term1Translated})`;
		} else if (term.includes("Term 2")) {
			termTranslated = `${termYear} ${term2Translated})`;
		} else if (term.includes("Term 3")) {
			termTranslated = `${termYear} ${term3Translated})`;
		} else {
			termTranslated = term;
		}

		/* ultimate translated exam name */
		const translatedExamName = `${formTranslated} - ${currentExamTranslated} - ${termTranslated}`;
		// console.log(translatedExamName);
		return translatedExamName;
	}

	translateFormName(rawFormName: string): string {
		// console.log(rawFormName);

		switch (rawFormName) {
		case "Form 1":
			return this.translate.instant("common.forms.form1");
		case "Form 2":
			return this.translate.instant("common.forms.form2");
		case "Form 3":
			return this.translate.instant("common.forms.form3");
		case "Form 4":
			return this.translate.instant("common.forms.form4");

		default:
			return rawFormName;
		}
	}

	currentClassName = "";
	translateCurrentClassName(rawClassName: string): void {
		// console.log(rawClassName);

		const classOfText = "Class Of";

		if (!rawClassName?.includes(classOfText)) {
			this.currentClassName = rawClassName;
			return;
		}

		const yearAndStream = rawClassName.slice(classOfText.length + 1);
		this.currentClassName = this.translate.instant("common.classOfYear", { yearAndStream });
	}

	initStickyHeader() {
		this.headervisibility = {};
		this.headervisibility.status = false;
		this.header_main = undefined;
	}

	getBarColor(marks: number) {
		return this.dataService.getColorScheme(marks);
	}

	viewSubjectPerformance(s: any) {
		let userid = -1;
		let subjectid = -1;
		let seriesid = -1;
		let egroupid = -1;
		// console.log(this.selectedExam.value);
		if (this.recentPerformance.userid != undefined && this.recentPerformance.userid > 0) {
			userid = this.recentPerformance.userid;
		}
		if (s.subjectid != undefined && s.subjectid > 0) {
			subjectid = s.subjectid;
		}
		if (this.selectedExam.value.seriesid != undefined && this.selectedExam.value.seriesid > 0) {
			seriesid = this.selectedExam.value.seriesid;
		} else if (this.selectedExam.value?.egroupid != undefined && this.selectedExam.value?.egroupid > 0) {
			egroupid = this.selectedExam.value.egroupid;
		}

		// NAVIGATE TO STUDENT SUBJECT AND PASS DATA
		// $state.go("home.analytics.student_subject", {
		//     userid: userid,
		//     subjectid: subjectid,
		//     seriesid: seriesid,
		//     egroupid: egroupid
		// });
		const url = `/main/students/analytics-subject/${userid}/${subjectid}/${seriesid}/${egroupid}`;
		// this.router.navigate(['/main/students/subject-analysis', userid, subjectid, seriesid, egroupid])
		this.router.navigate([url]);

	}

	viewPrintFormat(stream?: any) {
		let userid = 0;
		let streamid = 0;
		let seriesid = 0;
		let egroupid = 0;
		const intakid = 0;
		if (stream != undefined && stream != null && stream.streamid != undefined && stream.streamid > 0) {
			streamid = stream.streamid;
		} else {
			userid = this.recentPerformance.userid;
		}

		if (this.selectedExam.value.seriesid != undefined && this.selectedExam.value.seriesid > 0) {
			seriesid = this.selectedExam.value.seriesid;
		} else if (this.selectedExam.value.egroupid != undefined && this.selectedExam.value.egroupid > 0) {
			egroupid = this.selectedExam.value.egroupid;
		}

		// NAVIGATE TO PRINTOUTS STUDENT REPORT FORMS
		let reportFormRoute = "/main/printouts/rform";
		if (this.schoolTypeData?.isTanzaniaPrimary || this.schoolTypeData?.isTanzaniaSecondary) {
			reportFormRoute = "/main/printouts/tz-rform";
		}

		this.router.navigate([reportFormRoute, userid, streamid, seriesid, egroupid, intakid]);
		// $state.go("home.printouts.studentreport.form.r", {
		//     userid: userid,
		//     streamid: streamid,
		//     seriesid: seriesid,
		//     egroupid: egroupid
		// });
	}

	fetchContent(firstLoad = false) {
		let params = "";
		// console.warn("Selected exam >> ", this.selectedExam.value);
		if (this.selectedExam.value) {
			if (this.selectedExam.value.seriesid && this.selectedExam.value.seriesid > 0) {
				params = "?seriesid=" + this.selectedExam.value.seriesid;
			} else if (this.selectedExam.value.egroupid && this.selectedExam.value.egroupid > 0) {
				params = "?egroupid=" + this.selectedExam.value.egroupid;
			}
			if (params.length > 0) {
				params += "&ts=false";
			}
		}

		if (this.routeId > 0) {
			let prefix = "?";
			if (params.length > 0) {
				prefix = "&";
			}
			params += prefix + "userid=" + this.routeId;
		}

		const url = "analytics/student" + params;
		this.isLoading = true;
		this.dataService.get(url).subscribe({
			next: resp => {
				// console.warn("fetchContent DATA >> ", resp);
				this.recentPerformance = resp;

				this.translateCurrentClassName(this.recentPerformance.current_class_name);
				if (this.recentPerformance.aggregate_stats) {
					this.translateSubjects();
					this.translateSubjectComparisonListStudent();
					this.translateSubjectComparisonListClass();
					this.translateTimeSeriesExamGroupList();
				}

				// if (this.recentPerformance. != null && this.recentPerformance.ad != null && this.recentPerformance.ad.show != null && this.recentPerformance.ad.show) {
				//     this.recentPerformance.ad.sanitized_text = $sce.trustAsHtml(this.recentPerformance.ad.text);
				this.isLoading = false;
				// }
			},
			error: error => {
				console.error("fetchContent ERROR >> ", error);
				this.isLoading = false;
			},
			complete: () => {
				this.loadContent(firstLoad);
				// console.warn("Finished");
				this.isLoading = false;
			}
		});
	}

	loadContent(firstLoad = false) {
		// console.warn("LOAD NOW")
		if (this.recentPerformance.aggregate_stats != undefined) {
			this.no_data = false;
			this.isLoading = false;
		}
		if (this.recentPerformance.fees != null) {
			this.student_fees = this.recentPerformance.fees;
		}

		this.image_path = this.dataService.getUserImage();
		if (this.recentPerformance.url && this.recentPerformance?.url?.length > 0) {
			this.image_path = this.dataService.getUserImage(this.recentPerformance.url);
		}

		if (this.recentPerformance.exams) {
			this.exams = this.recentPerformance.exams.reverse();
			this.exams.forEach((exam, i) => {
				if (this.recentPerformance.examid == exam.examid && this.recentPerformance.examtype == exam.type) {
					if (firstLoad) {
						this.selectedExam.setValue(this.exams[i]);
					}
				}
			});
		}

		if (this.recentPerformance.timeseries) {
			if (this.recentPerformance.timeseries.examseries != undefined) {
				this.timeseries_examseries = [];
				this.timeseries_examseries_min = this.recentPerformance.timeseries.examseries.min;
				this.timeseries_examseries_max = this.recentPerformance.timeseries.examseries.max;
				this.recentPerformance.timeseries.examseries.list.forEach((exam: any) => {
					if (exam.value == undefined || exam.value == null || exam.value < 0) {
						exam.y = null;
					} else {
						exam.y = exam.value;
					}
				});
				this.timeseries_examseries = this.recentPerformance.timeseries.examseries.list;
			}

			if (this.recentPerformance.timeseries.examgroup != undefined) {
				this.timeseries_examgroup = [];
				this.timeseries_examgroup_min = this.recentPerformance.timeseries.examgroup.min;
				this.timeseries_examgroup_max = this.recentPerformance.timeseries.examgroup.max;
				this.timeSeriesExamGroupList.forEach((exam: any) => {
					if (exam.value == undefined || exam.value == null || exam.value < 0) {
						exam.y = null;
					} else {
						exam.y = exam.value;
					}
				});
				this.timeseries_examgroup = this.timeSeriesExamGroupList;
			}
		}

		if (this.recentPerformance.examtype == 1) {
			if (this.timeseries_examseries != undefined && this.timeseries_examseries != null && this.timeseries_examseries.length > 0) {


				this.highchart_time_series = {
					chart: {
						type: "line",
						height: 350
					},
					plotOptions: {
						series: { animation: true }
					},
					scrollbar: { enabled: true },
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
						max: this.timeseries_examseries_max,
						min: this.timeseries_examseries_min,
						lineWidth: 1,
						title: {
							text: "",
							align: "high"
						}
					},
					series: [{
						name: this.examMean,
						type: "line",
						cursor: "pointer",
						showInLegend: false,
						data: this.timeseries_examseries
					}],
					exporting: { enabled: true }
				};



				// this.highchart_time_series.series?.splice(0,0, {
				//   name: this.examMean,
				//   type: 'line',
				//   cursor: 'pointer',
				//   showInLegend: false,
				//   data: this.timeseries_examseries
				// });

				// this.highchart_time_series.series[0] = this.timeseries_examseries;
				// this.highchart_time_series.yAxis.min = this.timeseries_examseries_min;
				// this.highchart_time_series.yAxis!.max = this.timeseries_examseries_max;
			}
		} else if (this.recentPerformance.examtype == 2) {
			if (this.timeseries_examgroup != undefined && this.timeseries_examgroup != null && this.timeseries_examgroup.length > 0) {
				// this.highchart_time_series.series[0].data = this.timeseries_examgroup;
				// this.highchart_time_series.yAxis.min = this.timeseries_examgroup_min;
				// this.highchart_time_series.yAxis.max = this.timeseries_examgroup_max;


				this.highchart_time_series = {
					chart: {
						type: "line",
						height: 350
					},
					scrollbar: { enabled: true },
					plotOptions: {
						series: { animation: true },
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
						gridLineColor: "rgba(228, 229, 231, 0.60)",
						labels: {
							style: { textOverflow: "none" },
							autoRotation: [-45, -90]
						}
					},
					yAxis: {
						max: this.timeseries_examgroup_max,
						min: this.timeseries_examgroup_min,
						lineWidth: 1,
						title: {
							text: ""
						},
					},
					series: [{
						name: this.examMean,
						type: "line",
						cursor: "pointer",
						showInLegend: false,
						data: this.timeSeriesExamGroupList
					}],
					exporting: { enabled: true }
				};
			}
		}

		if (this.recentPerformance?.subject_comparison) {
			// this.highchart_subject_comparison.yAxis.min = this.recentPerformance.subject_comparison.min;
			// this.highchart_subject_comparison.yAxis.max = this.recentPerformance.subject_comparison.max;
			// this.highchart_subject_comparison.series[0].name = this.recentPerformance.subject_comparison.name_student;

			this.subjectComparisonListStudent.forEach((exam: any) => {
				if (!exam.value || exam.value < 0) {
					exam.y = null;
				} else {
					exam.y = exam.value;
				}
			});
			// this.highchart_subject_comparison.series[0].data = this.subjectComparisonListStudent;
			// this.highchart_subject_comparison.series[1].name = this.recentPerformance.subject_comparison.name_class;

			this.subjectComparisonListClass.forEach((exam: any) => {
				if (exam.value == undefined || exam.value == null || exam.value < 0) {
					exam.y = null;
				} else {
					exam.y = exam.value;
				}
			});

			// this.highchart_subject_comparison.series[1].data = this.subjectComparisonListClass;


			this.highchart_subject_comparison = {
				chart: {
					height: 340,
				},
				plotOptions: {
					series: { animation: true },

				},
				title: {
					text: ""
				},
				tooltip: { shared: true },
				legend: {
					layout: "horizontal",
					align: "right",
					verticalAlign: "top",
					floating: true,
					backgroundColor: "rgba(255, 255, 255, 0)"
				},
				credits: {
					enabled: false
				},
				yAxis: {
					labels: { y: 5, x: -2 },
					title: { text: "", align: "high" },
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					min: this.recentPerformance.subject_comparison.min,
					max: this.recentPerformance.subject_comparison.max,
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
				series: [
					{
						name: this.recentPerformance.subject_comparison.name_student,
						pointPlacement: "on",
						// data: this.recentPerformance.subject_comparison.list_student,
						data: this.subjectComparisonListStudent,
						type: "line",
						showInLegend: true,
						color: "rgb(98, 203, 49)",
						marker: { symbol: "circle" },
						zIndex: 2
					},
					{
						name: this.translateFormName(this.recentPerformance.subject_comparison.name_class),
						zIndex: 1,
						// data: this.recentPerformance.subject_comparison.list_class,
						data: this.subjectComparisonListClass,
						type: "area",
						pointPlacement: "on",
						showInLegend: true,
						color: "rgb(155, 155, 155)",
						marker: { symbol: "circle" },
					}
				],
			};


		}

		if (this.animateCount > 0) {
			// this.reAnimateViews();
		}
		this.animateCount++;
	}

}
