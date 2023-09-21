import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { environment } from "src/environments/environment";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { PrintoutsService } from "src/app/@core/services/printouts/printouts.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { TranscriptPdfDoc } from "../../../@core/models/printouts/transcripts/transcript-pdf-doc";
import { downloadActions } from "src/app/@core/types/download-actions";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

@Component({
	selector: "app-transcripts",
	templateUrl: "./transcripts.component.html",
	styleUrls: ["./transcripts.component.scss"]
})
export class TranscriptsComponent implements OnInit {
	exams: any = {};
	selected: any = {};
	stateparams: {
		userid: number;
		intakeid: number;
		streamid: number;
		subjectid: number;
		seriesid: number;
		egroupid: number;
	} = {
			userid: 0,
			intakeid: 0,
			streamid: 0,
			subjectid: 0,
			seriesid: 0,
			egroupid: 0
		};
	topBar: any = {};
	fetching_examsData_inprogress = false;
	fetching_examsList_inprogress = false;
	no_exams_msg = "";

	finally: any = {};
	report_displayed = false;

	transcript: any;
	tr_options: any = {};
	items: any[] = [];
	itemsFound = false;
	no_data = true;
	show_last_item = false;
	avatar_url = this.dataService.defaultUserAvatar;

	schoolTypeData?: SchoolTypeData;
	school_profile: any;
	school_logo_path: any;
	image_root = environment.apiurl + "/groups/images/";
	paramsPresent = false;

	/**Get user roles from subject */
	user_roles$: Observable<Role> = this.rolesService.roleSubject;
	isGeneratingPdfDownload = false;
	isGeneratingPdfPrint = false;

	constructor(
		private dataService: DataService,
		private activatedRoute: ActivatedRoute,
		private studentsService: StudentsService,
		private printoutsService: PrintoutsService,
		private rolesService: RolesService,
		private translate: TranslateService,
		private schoolService: SchoolService
	) {}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((param) => {
			this.stateparams.userid = param.userid;
			this.stateparams.streamid = param.streamid;
			if (param.userid) {
				this.getTranscript();
			}
			if (param.userid || param.streamid) {
				this.paramsPresent = true;
			}
		});
		this.getSchoolTypeData();
		this.selected.intake = {};
		this.selected.stream = {};
		this.selected.exam = {};
		this.selected.subject = {};
		this.topBar.IsCollapsed = false;

		this.finally.show = false;
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
		seriesid: any,
		egroupid: any
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
					if (this.exams == null || this.exams.length == 0) {
						this.exams = [];
						this.no_exams_msg = this.translate.instant(
							"printouts.transcripts.noExams"
						);
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

	getStudentTranscripts() {
		this.paramsPresent = false;
		let streamid = 0;
		if (
			this.selected?.stream &&
			this.selected?.stream?.streamid &&
			this.selected.stream.streamid > 0
		) {
			streamid = this.selected.stream.streamid;
		}

		let show_loader = true;
		if (
			this.stateparams.streamid > 0 &&
			this.stateparams.streamid == streamid
		) {
			show_loader = false;
		}

		if (show_loader) {
			this.fetching_examsData_inprogress = true;
		}

		// $state.go("home.printouts.transcript.report.r", {streamid: streamid});
		this.stateparams.streamid = streamid;
		this.getTranscript();
	}

	getTranscript() {
		let params = "";
		if (this.stateparams.streamid > 0) {
			params = "?streamid=" + this.stateparams.streamid;
		}
		this.printoutsService
			.getTranscript(this.stateparams.userid, params)
			.subscribe((resp) => {
				this.transcript = resp;
				this.controller();
				this.getSchoolProfile();
			});
	}

	get isKenyanSchool(): boolean {
		return (
			this.schoolTypeData?.isKcseSchool ||
			this.schoolTypeData?.isKcpePrimarySchool ||
			this.schoolTypeData?.isIgcse ||
			false
		);
	}

	getDocumentSample(): Promise<any> {
		return new TranscriptPdfDoc(
			this.school_profile,
			this.school_logo_path,
			this.transcript,
			this.tr_options.displayMarks,
			this.tr_options.displayPosition,
			this.tr_options.displayGradeDescription,
			this.dataService.defaultUserAvatar,
			this.schoolTypeData,
		).build();
	}

	async generatePdf(action: downloadActions = "download") {
		const docName: string = Array.isArray(this.transcript) ? `${this.schoolTypeData?.formoryear.trim()}-${
			this.selected.intake.classlevel
		}-${this.selected.stream.name}-${this.translate.instant(
			"printouts.topNav.transcripts"
		)}`: `${this.transcript.name}-${this.translate.instant("students.analytics.transcript")}`;

		action == "download"
			? (this.isGeneratingPdfDownload = true)
			: (this.isGeneratingPdfPrint = true);
		try {
			const doc = await this.getDocumentSample();
			action == "download"
				? doc.create().download(docName)
				: doc.create().print();
		} catch (e) {
			console.error(e);
		} finally {
			action == "download"
				? (this.isGeneratingPdfDownload = false)
				: (this.isGeneratingPdfPrint = false);
		}
	}

	controller() {
		this.tr_options.displayMarks = true;
		this.tr_options.displayPosition = true;
		this.tr_options.displayGradeDescription = true;

		if (this.transcript) {
			if (Array.isArray(this.transcript)) {
				this.items = this.transcript;
			} else {
				this.items.push(this.transcript);
			}
		}

		this.items.forEach((data) => {
			data.image_path = this.getUserImage(null);
			if (data?.url && data.url.length > 0) {
				data.image_path = this.getUserImage(data.url);
			}

			data.custom_terms = [];
			data.terms.forEach((t: any) => {
				const custom_t = JSON.parse(JSON.stringify(t));
				custom_t.isGrade = true;
				data.custom_terms.push(t);
				data.custom_terms.push(custom_t);
			});
		});

		this.itemsFound = true;
		this.finally.show = false;

		this.no_data = !(this.items != undefined && this.items.length > 0);
		this.show_last_item = true;
		if (this.itemsFound && this.no_data) {
			this.showlast(100);
		}
		this.report_displayed = true;
		this.showlast(2000);
	}

	showlast(time: number) {
		const intervalId = setInterval(() => {
			this.finally.show = true;
			if (this.finally.show) {
				this.topBar.IsCollapsed = true;
				this.fetching_examsData_inprogress = false;
				clearInterval(intervalId);
			}
		}, time);
	}

	getUserImage(image_path: any) {
		if (image_path === undefined || image_path === null) {
			return this.avatar_url;
		} else if (
			image_path.includes("http") ||
			image_path.includes(this.avatar_url)
		) {
			return image_path;
		} else {
			image_path = environment.apiurl + "/groups/images/" + image_path;
			return image_path;
		}
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe((val) => {
			this.schoolTypeData = val;
		});
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe((resp) => {
			this.school_profile = resp;
			if (
				this.school_profile.logo !== undefined &&
				this.school_profile.logo !== null
			) {
				if (this.school_profile.logo.includes("http")) {
					this.school_logo_path = this.school_profile.logo;
				} else {
					this.school_logo_path =
						environment.apiurl + "/groups/images/" + this.school_profile.logo;
				}
			} else {
				this.school_logo_path = "assets/img/default-logo.png";
			}
		});
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolTypeData?.isSouthAfricaPrimarySchool ||
			this.schoolTypeData?.isSouthAfricaSecondarySchool ||
			false
		);
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

	get upiTranslation(): string {
		const upiTranslation = BasicUtils.upiTranslation(this.schoolTypeData);

		return upiTranslation;
	}
}
