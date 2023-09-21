import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {DataService} from "src/app/@core/shared/services/data/data.service";
import {environment} from "src/environments/environment";
import {Observable, Subject} from "rxjs";
import {HotToastService} from "@ngneat/hot-toast";
import {TranslateService} from "@ngx-translate/core";
import {RolesService} from "src/app/@core/shared/services/role/roles.service";
import {Role} from "src/app/@core/models/Role";
import {SchoolService} from "../../../@core/shared/services/school/school.service";
import {UserService} from "src/app/@core/shared/services/user/user.service";
import {ResponseHandlerService} from "src/app/@core/shared/services/response-handler/response-handler.service";
import {PrintoutsService} from "src/app/@core/services/printouts/printouts.service";
import {StudentsService} from "src/app/@core/services/student/students.service";
import {SchoolTypeData} from "src/app/@core/models/school-type-data";
import {SchoolTypes} from "src/app/@core/enums/school-types";
import {SchoolInfo} from "src/app/@core/models/school-info";
import {takeUntil} from "rxjs/operators";
import {MeritListPdfDoc} from "../../../@core/models/printouts/merit-list/merit-list-pdf-doc";

// TODO: unsubscribe all rxjs subscriptions on 'OnDestroy' lifecycle hook - to avoid memory leaks

@Component({
	selector: "app-merit-list",
	templateUrl: "./merit-list.component.html",
	styleUrls: ["./merit-list.component.scss"]
})
export class MeritListComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	exams: any = {};
	selected: any = {};
	stateparams: any = {};
	topBar: any = {};
	fetchingExamsDataInProgress = false;
	fetching_examsList_inprogress = false;
	no_exams_msg = "";

	finally: any = {};
	report_displayed = false;

	gettingDataComplete = false;

	count = 0;
	data: any;
	completeList: any;
	showPrintFormat = false;
	user_info: any;

	schoolTypeData!: SchoolTypeData;
	readonly schoolTypes = SchoolTypes;
	isMobileApp = false;

	page = 0;
	schoolProfile!: SchoolInfo;
	schoolLogoPath: any;
	isPrinting = false;
	paramsPresent = false;
	showGender = false;

	@ViewChild("scrollHere") scrollHere?: ElementRef;

	/**Get user roles from subject */
	userRoles$: Observable<Role> = this.rolesService.roleSubject;


	// meritData: any;
	constructor(
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private studentsService: StudentsService,
		private userService: UserService,
		private printoutsService: PrintoutsService,
		private rolesService: RolesService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private schoolService: SchoolService,
		private errorHandler: ResponseHandlerService
	) {
	}

	ngOnInit(): void {
		this.selected.intake = {};
		this.selected.streamID = 0;
		this.selected.exam = {};
		this.selected.subject = {};
		this.stateparams.intakeid = 0;
		this.stateparams.streamid = 0;
		this.stateparams.subjectid = 0;
		this.stateparams.seriesid = 0;
		this.stateparams.egroupid = 0;
		this.activatedRoute.queryParams.subscribe((params) => {
			this.stateparams.intakeid = parseInt(params.intakeid);
			this.stateparams.streamid = parseInt(params.streamid);
			this.stateparams.seriesid = parseInt(params.seriesid);
			this.stateparams.egroupid = parseInt(params.egroupid);
			this.stateparams.most_improved = parseInt(params.most_improved);
			if (this.stateparams.intakeid || this.stateparams.streamid || this.stateparams.seriesid || this.stateparams.egroupid || this.stateparams.most_improved) {
				this.paramsPresent = true;
				this.controller();
			}
			if (params.intakeid) {
				this.getSchoolTypeData(true);
			} else {
				this.getSchoolTypeData();
			}
		});
		this.getUserInfo();

		this.topBar.IsCollapsed = false;

		this.finally.show = false;

		this.isMobileApp = this.dataService.getIsMobileApp();

		this.getSchoolProfile();

	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	invalidateStreams() {
		this.selected.streamID = 0;
		if (this.selected.intake == null) {
			this.exams = [];
		}
	}

	fetchIntakeStreamExams(intake: any, streamID: number | null, seriesid?: any, egroupid?: any) {
		let params = "";
		let has_state_params = false;
		let has_selected_exam = false;
		if ((seriesid != null && seriesid > 0) || (egroupid != null && egroupid > 0)) {
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

		if (streamID) {
			params = "?streamid=" + streamID + "&mobile=false";
		} else if (intake != null && intake.intakeid != null) {
			params = "?intakeid=" + intake.intakeid + "&mobile=false";
		}

		if (params.length > 0) {
			if (!has_state_params) {
				this.fetching_examsList_inprogress = true;
				this.exams = [];
				this.selected.exam = {};
			} else {
				this.fetchingExamsDataInProgress = true;
			}
			this.no_exams_msg = "";

			this.studentsService.getStreamIntakeExamData(params, true).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
				this.exams = response?.exams?.reverse();
				this.fetching_examsList_inprogress = false;
				this.fetchingExamsDataInProgress = false;
				if (this.exams == null || this.exams.length == 0) {
					this.exams = [];
					this.no_exams_msg = this.translate.instant("common.noExams");
				} else {
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

	getMeritList() {
		this.paramsPresent = false;
		let seriesid = 0;
		let egroupid = 0;
		let intakeid = 0;
		let streamid = 0;

		if (this.selected.streamID && this.selected.streamID > 0) {
			streamid = this.selected.streamID;
		} else if (this.selected.intake != undefined && this.selected.intake != null && this.selected.intake.intakeid != undefined && this.selected.intake.intakeid != null && this.selected.intake.intakeid > 0) {
			intakeid = this.selected.intake.intakeid;
		}

		if (this.selected.exam != undefined && this.selected.exam != null) {
			if (this.selected.exam.seriesid != undefined && this.selected.exam.seriesid != null && this.selected.exam.seriesid > 0) {
				seriesid = this.selected.exam.seriesid;
			} else if (this.selected.exam.egroupid != undefined && this.selected.exam.egroupid != null && this.selected.exam.egroupid > 0) {
				egroupid = this.selected.exam.egroupid;
			}
		}

		this.stateparams.intakeid = intakeid;
		this.stateparams.streamid = streamid;
		this.stateparams.seriesid = seriesid;
		this.stateparams.egroupid = egroupid;
		this.controller();
	}

	controller() {
		this.fetchingExamsDataInProgress = true;
		// this.stream = this.stateparams.stream;
		this.gettingDataComplete = false;
		this.getPerformanceList(0);
	}

	getPerformanceList(page: number, viewPrintFormat = false, exportExcel = false, downloadPdf = false) {
		this.gettingDataComplete = false;
		let params = "";
		if (this.stateparams.streamid > 0) {
			params = "?streamid=" + this.stateparams.streamid;
		} else if (this.stateparams.intakeid > 0) {
			params = "?intakeid=" + this.stateparams.intakeid;
		}

		if (this.stateparams.seriesid > 0) {
			params += "&seriesid=" + this.stateparams.seriesid;
		} else if (this.stateparams.egroupid > 0) {
			params += "&egroupid=" + this.stateparams.egroupid;
		}

		// console.warn("final", this.stateparams.most_improved);

		if (this.stateparams.most_improved == 1 || this.stateparams.most_improved == "1") {
			params += "&mostimproved=true";
		}
		if (viewPrintFormat || downloadPdf || exportExcel) {
			params += "&all=true";
			if (exportExcel) {
				params += "&download=true";
			}
		} else {
			params += "&page=" + page;
		}


		if (exportExcel) {
			this.printoutsService.getExcelMeritList(params).pipe(takeUntil(this.destroy$)).subscribe({
				next: (resp: any) => {
					const blob = new Blob([resp], {type: "application/vnd.ms-excel"});
					this.printoutsService.custom_saver(blob, `${this.data.examname}_Merit_List_${new Date().getTime()}`);
				},
				error: error => {
					this.errorHandler.error(error, "getPerformanceList()");
				},
				complete: () => {
					this.fetchingExamsDataInProgress = false;
				}
			});
		} else {
			this.dataService.get("analytics/streamintake/meritlist" + params).pipe(takeUntil(this.destroy$)).subscribe((resp: any) => {
				resp.labels = this.reorderLabels(resp.labels);
				if (resp.labels) resp.labels = resp.labels.filter(label => label.header !== "UPI");

				if (!viewPrintFormat && !downloadPdf) {
					this.data = resp;
					this.count = page * 20;
				}
				if (downloadPdf) {
					this.generatePdf("download", resp);
				} else if (viewPrintFormat) {
					this.completeList = resp;
					this.showPrintFormat = true;

					setTimeout(() => {
						this.scrollHere?.nativeElement.scrollIntoView({behavior: "smooth", block: "start"});
					}, 200);
				}

				this.gettingDataComplete = true;
				this.fetchingExamsDataInProgress = false;
				this.finally.show = true;
				this.getSchoolProfile();
			});
		}
	}

	/**
	 * Rearranges elements of an array
	 * @param input Array of the inputs to arrange
	 * @param from Index element to move is at
	 * @param to Index to move element to
	 * @returns Rearrange array
	 */
	reArrangeElements(input: Array<{ header: string, label: string }>, from: number, to: number) {
		let elementsToMove = 1;
		const elm = input.splice(from, elementsToMove)[0];
		elementsToMove = 0;
		input.splice(to, elementsToMove, elm);
		return input;
	}

	reorderLabels(labels: any[]) {
		const kcpeLabel = labels.findIndex((label) => label.header === "KCPE");
		const index = labels.findIndex((label) => label.label === "name") + 2;
		if (kcpeLabel > 5) {
			return this.reArrangeElements(labels, kcpeLabel, index);
		}
		return labels;
	}

	getUserInfo() {
		this.userService.userInfoSubject.pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.user_info = resp;
		});
	}

	export_class_results_withLabelsList(schoolname: any, resp: any) {
		// console.log("resp", resp);

		// const sheet_name = "results";
		const sheet_name: string = this.translate.instant("printouts.meritList.excelTemplateDownload.workSheetName");
		const document_name = resp.examname;
		const header: any[] = [];

		resp.labels.forEach((l: any) => {
			header.push(l.header);
		});

		const header_size = header.length;
		const ranges: any[] = [];
		const data: any[] = [];
		const merged_header: any[] = [];

		for (let i = 0; i < header_size; i++) {
			if (i === 0) {
				merged_header.push((document_name + " - " + schoolname));
			} else {
				merged_header.push("");
			}
		}

		data.push(merged_header);
		data.push(header);

		resp.list.forEach((d: any) => {
			const student: any[] = [];

			resp.labels.forEach((l: any) => {
				if (d[l.label] == undefined || d[l.label] == null) {
					student.push("");
				} else if (d[l.label].score_grade != undefined) {
					student.push(d[l.label].score_grade);
				} else {
					student.push(d[l.label]);
				}
			});

			data.push(student);
		});

		this.dataService.downloadExcelSheet(data, document_name, sheet_name);
	}

	exportToExcel(exportExcel: boolean) {
		this.getPerformanceList(0, false, exportExcel);
	}

	viewPrintFormat() {
		this.getPerformanceList(0, true);
	}

	hidePrintFormat() {
		this.showPrintFormat = false;
		this.completeList = {};
	}

	scroll(el: HTMLElement) {
		el.scrollIntoView({behavior: "smooth"});
	}

	getSchoolTypeData(hasIntake?: boolean) {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe(val => {
			this.schoolTypeData = val;
			if (hasIntake && this.schoolTypeData) {
				// console.warn("this.stateparams.intakeid >>", this.stateparams.intakeid);
				this.selected.intake = this.schoolTypeData?.current_forms_list?.find(({intakeid}) => intakeid == this.stateparams.intakeid);
				this.fetchIntakeStreamExams(this.selected.intake, null, this.stateparams.seriesid);
			}
		});
	}

	getPage() {
		return Math.trunc((this.data?.entries) / 20);
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolTypeData?.isSouthAfricaPrimarySchool
			|| this.schoolTypeData?.isSouthAfricaSecondarySchool
			|| false
		);
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.pipe(takeUntil(this.destroy$)).subscribe(resp => {
			// console.warn('getSchoolProfile() >> ', resp);
			this.schoolProfile = resp;
			if (this.schoolProfile?.logo) {
				if (this.schoolProfile?.logo?.includes("http")) {
					this.schoolLogoPath = this.schoolProfile.logo;
				} else {
					this.schoolLogoPath = environment.apiurl + "/groups/images/" + this.schoolProfile.logo;
				}
			} else {
				this.schoolLogoPath = "../../../../assets/img/default-logo.png";
			}
			if (this.schoolProfile?.genderType === 3) {
				this.showGender = true;
			}
		});
	}

	createdPDF: any;
	isExportingPdf = false;

	// TODO: refactor the method below (limit use of many loops)
	async generatePdf(action: "download" | "print", response: any) {

		const showStudentScoreOnly = (
			this.schoolTypeData?.isSouthAfricaPrimarySchool ||
			this.schoolTypeData?.isSouthAfricaSecondarySchool ||
			this.schoolTypeData?.isIvorianSchool ||
			this.schoolTypeData?.isGuineaSchool
		);

		const meritListText = this.translate.instant(this.isSouthAfricanSchool ? "printouts.meritList.titleMarkSheet" : "printouts.meritList.title");

		const meritListPdfDoc = new MeritListPdfDoc(
			this.schoolProfile,
			this.schoolTypeData,
			meritListText,
			response.examname,
			response.labels,
			response.list,
			response.merit_summary_list_labels,
			response.merit_summary_list,
			response.current_class_summary_list_labels,
			response.current_class_summary_list,
			showStudentScoreOnly,
		);

		const docTitle: string = meritListText;
		const docTitleFormatted = docTitle.replace(" ", "-");
		const docFullPdfTitle = `${docTitleFormatted}_${response.examname}`;
		try {
			this.isExportingPdf = true;
			const document = await meritListPdfDoc.build();
			document.create().download(docFullPdfTitle);
		} catch (e) {
			console.error(e);
			this.toastService.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
		} finally {
			this.isExportingPdf = false;
		}
	}

	downloadAsPdf(): void {
		this.getPerformanceList(0, false, false, true);
	}

	printPage2(printSectionId: string) {
		const innerContents = document.getElementById(printSectionId)?.innerHTML;

		const popupWinindow = window.open("", "_blank", "width=A2");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"../../../../styles.scss\"><link rel=\"stylesheet\" href=\"../../../../assets/vendor_components/bootstrap/dist/css/bootstrap.min.css\"><link rel=\"stylesheet\" href=\"../../../../assets/css/vendors_css.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
	}

}
