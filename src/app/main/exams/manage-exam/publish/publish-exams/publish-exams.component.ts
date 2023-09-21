import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { finalize } from "rxjs/operators";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-publish-exams",
	templateUrl: "./publish-exams.component.html",
	styleUrls: ["./publish-exams.component.scss"]
})
export class PublishExamsComponent implements OnInit {

	list: any = {};
	previousExam: any = {};
	gradingSystem: any = [];
	basicDetails: any = {};
	selectedListExam: any = {};
	selectExamIndex: any = {};
	selectedListExamSubjects: any[] = [];
	schoolData!: SchoolTypeData;
	selectedGradingSystem: any = "-1";

	routeParams: any;

	upload_results_success_status!: boolean;
	error_exam!: boolean;
	error_msg!: string;
	only_missing_streams!: boolean;
	showAutoStreamsButton!: boolean;
	rightSidebar!: boolean;
	custom_errors!: any[];
	showLoading = false;

	combine_sstre = true;
	sst_ratio = 70;
	re_ratio = 30;
	show_reminder = false;
	intakeId?: number;

	edit_min_subjects: any = {};
	previousRankingCriteria: any;
	previousGradingSystem: any;

	constructor(
		private examService: ExamService,
		private mentionService: MentionService,
		private dataService: DataService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private router: Router,
		public _location: Location
	) {
	}


	ngOnInit(): void {
		this.loadSchoolData();

		this.initBoolean();
		const param = this.route.snapshot.params;
		this.routeParams = param;
		this.intakeId = param.intakeId;
		this.loadPreviousRankingCriteria();
		this.loadExamsToPublishDean(this.intakeId);
		this.loadBasicDetails(this.intakeId);
		this.loadPreviousExams(this.intakeId);
		this.edit_min_subjects.show = false;
	}

	loadSchoolData(): void {
		this.dataService.schoolData.subscribe(
			(schoolTypeData: SchoolTypeData) => {
				this.schoolData = schoolTypeData;
				if (this.isMentionSchool) {
					this.loadMentions();
					this.rankCriteria = 1;
				} else {
					this.loadGradeMapping();
				}
			}, () => {
				/*no op*/
			}
		);
	}

	loadGradeMapping() {
		this.examService.getGradeMapping().subscribe({
			next: (res) => this.gradingSystem = res,
			error: err => this.responseHandler.error(err, "loadGradeMapping()"),
		});
	}

	loadMentions() {
		this.mentionService.getMentionsMapping().subscribe(
			(res) => {
				this.gradingSystem = res;
				if (Object.keys(res).length > 0) {
					this.gradingSystem.map((mention: any) => {
						mention.gsid = mention.mentionSystemId;
					});
				}
			}, () => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	initBoolean() {
		this.upload_results_success_status = false;
		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.only_missing_streams = true;
		this.showAutoStreamsButton = false;
		this.rightSidebar = false;
	}

	loadPreviousRankingCriteria() {
		const params: any = "?intakeId=" + this.routeParams.intakeId + "&isExamSeries=true";
		const url: any = "/results/ranking/previousExam" + params;
		this.examService.doGet(url).subscribe(
			resp => {
				if (resp) {
					this.previousRankingCriteria = resp.rankingCriteria;
					this.toggleRankingCriteria(resp.rankingCriteria);
				} else {
					this.previousRankingCriteria = 0;
					this.toggleRankingCriteria(0);
				}
			},
			err => {
				console.error(err);
			}, () => {
				this.loadPreviousGradingSystem();
			}
		);
	}

	toggleRankingCriteria(rankCriteria: number) {
		this.rankCriteria = rankCriteria;
	}

	loadPreviousGradingSystem() {
		const params: any = "?intakeId=" + this.routeParams.intakeId + "&isExamSeries=true";
		const url: any = "/results/grades/previousExam" + params;
		this.examService.doGet(url).subscribe(
			e => {
				this.previousGradingSystem = e;
				this.initPreviousItems();
			},
			r => {
				console.log(r);
			}
		);
	}

	initPreviousItems() {
		this.autoSelectPrevGs();
		this.examsToPublish.forEach((exam, i) => {
			exam.subjects.forEach((subject: any, j: any) => {
				if (j == 0) {
					subject.preview = true;
				} else {
					subject.preview = false;
				}
				subject.gs = {};
				const gs: any = this.gs_hashmap.get(subject.intCode);
				subject.gs = gs;
				subject.gsid = (gs == undefined) ? "-1" : gs.gsid;
				// subject.gsid = this.gs_hashmap.get(subject.intCode).gsid;
				if (this.gradingSystem && this.gradingSystem.length === 1) {
					// console.log(subject);
					subject.gs = this.gradingSystem[0];
					subject.gsid = this.gradingSystem[0]?.gsid;
					// console.table(subject)
				}
			});
		});
	}

	gradinSystemList_HashMap = new Map();
	gs_hashmap = new Map();

	//Autoselect the previous grading system
	autoSelectPrevGs() {
		//set gradeMaping  to is's hasmap
		for (let y = 0; y < this.gradingSystem.length; y++) {
			const x = this.gradingSystem[y];
			this.gradinSystemList_HashMap.set(x.gsid, x);
		}
		for (let x = 0; x < this.previousGradingSystem.length; x++) {
			const prev_gs = this.previousGradingSystem[x];
			this.gs_hashmap.set(prev_gs.subjectIntCode, this.gradinSystemList_HashMap.get(prev_gs.gradingSystemId));
		}
	}

	isSendingReminders = false;

	sendReminders() {
		this.initBoolean2();
		this.isSendingReminders = true;
		this.dataService.send(null, "results/reminders/" + this.selectedListExam.examid + "/-1?intakeid=" + this.intakeId).subscribe({
			next: (resp: any) => {
				this.isSendingReminders = false;
				if (resp.responseCode == 200) {
					// console.log(resp.response.message);
					const message = this.translate.instant("exams.publishExams.toastMessages.sendRemindersSuccess");
					this.toastService.success(message);
					this.show_reminder = false;
				}
			},
			error: err => {
				this.isSendingReminders = false;
				const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.error_msg = errorMsg;
				// this.error_msg = "An unexpected error occurred";
				if (err !== undefined && err.message !== undefined) {
					this.error_msg = err.error.message;
				}
				this.toastService.error(this.error_msg);
				this.error_exam = true;
			}
		});
	}

	publish_success_status = false;
	initBoolean2() {
		this.publish_success_status = false;
		this.error_exam = false;
		this.error_msg = "";
	}

	init_edit_min_num_of_subjects(status: boolean) {
		if (status) {
			this.edit_min_subjects.new_value = this.selectedListExam.min;
		}
		this.edit_min_subjects.show = status;
	}

	save_min_num_of_subjects() {
		if (this.edit_min_subjects.new_value == undefined || this.edit_min_subjects.new_value == null || this.edit_min_subjects.new_value < this.schoolData.minSubjects) {
			this.toastService.info("Please specify a value that is greater than or equal to " + this.schoolData.minSubjects);
		} else {
			const url = "results/edit/min_number_of_subjects?seriesid=" + this.selectedListExam.examid + "&intakeid=" + this.intakeId + "&min=" + this.edit_min_subjects.new_value;
			this.dataService.send(null, url).subscribe({
				next: (resp: any) => {
					console.warn("save_min_num_of_subjects >> ", resp);
					if (resp.responseCode == 200) {
						console.log(resp.message);

						const message = this.translate.instant("exams.publishExams.toastMessages.saveMinSubjectsSuccess");
						this.toastService.success(message);

						this.selectedListExam.min = this.edit_min_subjects.new_value;
						this.edit_min_subjects.show = false;
					}
				},
				error: err => {
					console.error("save_min_num_of_subjects >> ", err);
					const errorMsg = this.translate.instant("common.toastMessages.anErrorOccurred");
					let error_msg = errorMsg;
					// let error_msg = "An unexpected error occurred";
					if (err !== undefined && err.message !== undefined) {
						error_msg = err.message;
					}
					this.toastService.error(error_msg);
				}
			});
		}
	}

	loadPreviousExams(intake: any) {
		this.examService.getPublishExamPreviousExam(intake).subscribe({
			next: (res) => this.previousExam = res,
			error: err => this.responseHandler.error(err, "loadPreviousExams()"),
		});
	}

	isLoadingExamsToPublish = false;
	examsToPublish: any[] = [];
	stateparams_seriesid_found = false;

	loadExamsToPublishDean(intake: any) {
		this.isLoadingExamsToPublish = true;
		this.examService.getPublishExamList(intake).subscribe(
			(res) => {
				this.list = res;
				this.examsToPublish = res.list;
				res.list.forEach((exam: any, index: any) => {
					(index == 0) ? this.selectedGradingSystem = exam.gsid : this.selectedGradingSystem = "-1";
					if (exam.examid == this.routeParams.seriesId) {
						this.selectedListExam = exam;

						this.stateparams_seriesid_found = true;
						this.initSSTREandReminders();
						this.selectExamIndex = index;
						this.selectedListExamSubjects = exam.subjects;
						this.selectedListExamSubjects.forEach((s: any) => {
							s.gsid = (this.gradingSystem?.length == 1) ? this.gradingSystem[0].gsid : this.selectedListExam.gsid;
						});
						this.selectedListExam.subjects = this.selectedListExamSubjects;

					}
					this.isLoadingExamsToPublish = false;
				});
			}, () => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
				this.isLoadingExamsToPublish = false;
			}
		);
	}

	loadBasicDetails(intake: any) {
		this.examService.getBasicDetails(intake).subscribe(
			(res) => this.basicDetails = res,
			(err) => this.responseHandler.error(err, "loadBasicDetails()"),
		);
	}

	selectExam() {
		this.selectedListExam = this.list.list[this.selectExamIndex];
	}

	initItems() {
		this.initBoolean2();
	}

	reminder_st = "";

	initSSTREandReminders() {
		this.combine_sstre = false;
		if (this.selectedListExam !== undefined && this.selectedListExam !== null) {
			//this.reminder_ct = "Hello,\n\nPlease follow up with your class' subject teachers to ensure they have uploaded and published their subject results for " + this.exam.examname + ". Once that is done, ensure you publish your class' results.";
			this.reminder_st = "Hello,\n\nPlease ensure you have uploaded and published your subject results for " + this.selectedListExam.examname;
			if (this.selectedListExam.sstre_combinable !== undefined && this.selectedListExam.sstre_combinable !== null && this.selectedListExam.sstre_combinable) {
				this.combine_sstre = true;
			}
		}
	}

	selected_gs: any = "";
	buttonClicked = false;
	rankCriteria?: number;

	publishSeries() {
		if ((this.selectedGradingSystem == -1 || this.selectedGradingSystem == 0) && this.rankCriteria == 0) {
			const selectOverallGradingSystemText = this.translate.instant("exams.publishExams.textSelectOverallGs");
			const selectOverallMentionText = this.translate.instant("exams.publishExams.textSelectOverallMention", { mention: this.schoolData.mentionLabel });

			this.toastService.error(this.isMentionSchool ? selectOverallMentionText : selectOverallGradingSystemText);

			return;
		}

		this.buttonClicked = true;
		this.initBoolean();

		const seriesid = this.selectedListExam.examid;
		const exam = this.selectedListExam;
		this.selected_gs = {};
		if (exam.gsid >= 0) {
			this.selected_gs = exam.gsid;
		}

		if (this.gradingSystem != null && this.selectedGradingSystem != null) {
			this.selected_gs = this.selectedGradingSystem;
		}

		if (!this.isMentionSchool &&(this.rankCriteria == 1 || this.rankCriteria == 2)) {
			this.selected_gs = 0;
		}

		const subjectGS: any = {};
		const subjErrors: any[] = [];
		this.selectedListExamSubjects.forEach((sgs: any) => {
			if (sgs.gsid != null && sgs.gsid >= 0) {
				subjectGS[sgs.textCode] = +sgs.gsid;
			} else {
				subjErrors.push(sgs.name);
			}
		});

		if (this.selected_gs >= 0 && subjErrors.length == 0) {
			Swal.fire({
				title: this.translate.instant("exams.publishExams.swal.title"),
				text: this.translate.instant("exams.publishExams.swal.text"),
				icon: "question",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					this.showLoading = true;
					const gradingLabel = this.isMentionSchool ? "mention" : "grading";

					let param = exam.examid + "/-1?" + gradingLabel + "=" + this.selected_gs + "&rp=" + this.rankCriteria + "&min=" + exam.min + `&subject${gradingLabel}=` + JSON.stringify(subjectGS);

					if (this.schoolData.isKcpePrimarySchool && this.combine_sstre) {
						param += "&sst_ratio=" + this.sst_ratio + "&re_ratio=" + this.re_ratio;
					}

					param += "&intakeid=" + this.routeParams.intakeId;

					this.proceedToPublishExamSeries(param);
				}
			});
		}
	}

	proceedToPublishExamSeries(params) {
		this.examService.publishExamsSeries(params).pipe(finalize(() => this.showLoading = false)).subscribe({
			complete: () => {
				this.publishSeriesSuccess();
			},
			error: (error) => {
				this.responseHandler.error(error, "proceedPublishExamSeries()");
			}
		});
	}

	publishSeriesSuccess() {
		Swal.fire({
			title: this.translate.instant("exams.publishExams.swal.title2"),
			text: this.translate.instant("exams.publishExams.swal.text2"),
			icon: "success",
			showCancelButton: false,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
		}).then(() => {
			this.router.navigateByUrl("/main/exams/manage");
		});
	}

	get isMentionSchool(): boolean {
		return (
			this.schoolData?.isGuineaSchool
			|| this.schoolData?.isIvorianSchool
			|| this.schoolData?.isSouthAfricaPrimarySchool
			|| this.schoolData?.isSouthAfricaSecondarySchool
			|| false
		);
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolData?.isSouthAfricaPrimarySchool
			|| this.schoolData?.isSouthAfricaSecondarySchool
			|| false
		);
	}
}
