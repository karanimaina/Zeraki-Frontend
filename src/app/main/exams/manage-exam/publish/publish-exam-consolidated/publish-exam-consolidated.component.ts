import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-publish-exam-consolidated",
	templateUrl: "./publish-exam-consolidated.component.html",
	styleUrls: ["./publish-exam-consolidated.component.scss"]
})
export class PublishExamConsolidatedComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	exam: any;
	previousExam: any = {};
	gradingSystem: any = [];
	basicDetails: any = {};
	selectedListExam: any = {};
	selectExamIndex: any = {};
	selectedListExamSubjects: any[] = [];
	schoolData: any = {};
	selectedGradingSystem: any;

	routeParams: any;

	meanMarks = true;
	KCSEPoints = false;
	meanPoints = false;

	upload_results_success_status!: boolean;
	error_exam!: boolean;
	error_msg!: string;
	only_missing_streams!: boolean;
	showAutoStreamsButton!: boolean;
	rightSidebar!: boolean;
	custom_errors!: any[];
	showLoading = false;
	list: any = {};
	isLoading = false;

	combine_sstre = true;
	sst_ratio = 70;
	re_ratio = 30;

	constructor(
    private examService: ExamService,
    private dataService: DataService,
		private mentionService: MentionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private responseHandler: ResponseHandlerService
	) { }

	selectMeanMarks() {
		this.meanMarks = true;
		this.KCSEPoints = false;
		this.meanPoints = false;
	}

	selectMeanPoints() {
		this.meanMarks = false;
		this.KCSEPoints = false;
		this.meanPoints = true;
	}

	selectKcsePoints() {
		this.meanMarks = false;
		this.KCSEPoints = true;
		this.meanPoints = false;
	}

	ngOnInit(): void {
		this.loadSchoolData();
		this.initBoolean();
		this.route.params.subscribe((param) => {
			// console.log(param)
			this.routeParams = param;
			const intakeId = param.intakeId;
			this.loadExamsToPublishDean(intakeId);
			this.loadBasicDetails(intakeId);
			this.loadPreviousExams(intakeId);
		});
	}

	loadSchoolData(): void {
		this.dataService.schoolData.subscribe(
			(res) => {
				this.schoolData = res;
				this.fetchCountryGradingSystem(this.schoolData);
			});
	}

	private fetchCountryGradingSystem(schoolTypeData: SchoolTypeData) {
		if(schoolTypeData?.isSouthAfricaPrimarySchool || schoolTypeData?.isSouthAfricaSecondarySchool) {
			this.loadMentions();
		} else {
			this.loadGradeMapping();
		}
	}

	private loadMentions() {
		this.mentionService.getMentionsMapping().pipe(takeUntil(this.destroy$)).subscribe({
			next: (res) => {
				this.gradingSystem = res;

				if(Object.keys(res).length > 0 ) {
					this.gradingSystem.map((mention: any) => {
						mention.gsid = mention.mentionSystemId;
					});
				}
			},
			error: (err) =>	this.responseHandler.error(err, "loadMentions()"),
		});
	}

	loadPreviousExams(intake: any) {
		this.examService.getEgroupPublishExamPreviousExam(intake).subscribe(
			(res) => {
				this.previousExam = res;
			}, (err) => {
				this.responseHandler.error(err, "loadPreviousExams()");
			}
		);
	}

	loadExamsToPublishDean(intake: any) {
		this.isLoading = true;
		this.examService.getEgroupPublishExamList(intake).subscribe(
			(res) => {
				this.list = res;
				res.list.forEach((exam: any, index: any) => {
					if (exam.examid == this.routeParams.examId) {
						this.selectedListExam = exam;
						this.selectExamIndex = index;
						this.selectedListExamSubjects = exam.subjects;
						this.selectedListExamSubjects.forEach((s: any, i: any) => {
							s.isPreview = (i == 0) ? true : false;
							s.gsid = (this.gradingSystem.length == 1) ? this.gradingSystem[0].gsid : this.selectedListExam.gsid;
						});
						this.selectedListExam.subjects = this.selectedListExamSubjects;
					}
				});
				this.isLoading = false;
			}, (err) => {
				this.responseHandler.error(err, "loadExamsToPublishDean()");
				this.isLoading = false;
			}
		);
	}

	loadGradeMapping() {
		this.examService.getGradeMapping().subscribe(
			(res) => {
				this.gradingSystem = res;
				this.selectedGradingSystem = (this.gradingSystem && this.gradingSystem.length == 1) ? res[0] : "-1";
			}, (err) => {
				this.responseHandler.error(err, "loadGradeMapping()");
			}
		);
	}

	loadBasicDetails(intake: any) {
		this.examService.getBasicDetails(intake).subscribe(
			(res) => {
				this.basicDetails = res;
			}, (err) => {
				this.responseHandler.error(err, "loadBasicDetails()");
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

	selectExam() {
		this.selectedListExam = this.list.list[this.selectExamIndex];
	}

	selected_gs: any = "";
	buttonClicked = false;

	publishEgroup() {
		this.buttonClicked = true;
		this.initBoolean();
		const egroupid = this.selectedListExam.examid;
		const exam = this.selectedListExam;
		if (exam.gsid >= 0) {
			this.selected_gs = exam.gsid;
		}

		if (this.gradingSystem != null && this.selectedGradingSystem != null) {
			this.selected_gs = this.selectedGradingSystem;
		}

		const subjectGS: any = {};
		const subjectGSErrors: any[] = [];
		this.selectedListExamSubjects.forEach((sgs: any, i: any) => {
			(sgs.gsid != null && sgs.gsid != -1) ?
				subjectGS[sgs.textCode] = +sgs.gsid
				:
				subjectGSErrors.push(sgs.name);
		});

		if (this.KCSEPoints || this.meanPoints) {
			this.selected_gs = 0;
		}

		if (this.selected_gs >= 0 && subjectGSErrors.length == 0) {
			Swal.fire({
				title: this.translate.instant("exams.publishExamsConsolidated.swal.title"),
				text: this.translate.instant("exams.publishExamsConsolidated.swal.text"),
				icon: "question",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					this.showLoading = true;

					const showMention = this.schoolData?.isSouthAfricaPrimarySchool || this.schoolData?.isSouthAfricaSecondarySchool;
					const gradingLabel = showMention ? "mention" : "grading";

					const rankCriteria = (this.meanMarks) ? 0 : (this.KCSEPoints) ? 1 : 2;
					let param = `?${gradingLabel}=${this.selected_gs}&rp=${rankCriteria}&subject${gradingLabel}=${JSON.stringify(subjectGS)}`;

					if (this.schoolData.isKcpePrimarySchool && this.combine_sstre) {
						param += "&sst_ratio=" + this.sst_ratio + "&re_ratio=" + this.re_ratio;
					}

					param += "&intakeid=" + this.routeParams.intakeId;
					const url = "/" + egroupid + "/-1" + param;
					this.showLoading = true;
					this.proceedPublishEgroup(url);
				}
			});

		}
	}

	proceedPublishEgroup(url) {
		this.examService.publishExamsEGroup(url).subscribe(
			(resp) =>
				this.publishEgroupSuccess()
			, (err) =>
				this.publishEgroupError(err)
		);
	}

	publishEgroupSuccess() {
		this.showLoading = false;
		Swal.fire({
			title: this.translate.instant("exams.publishExamsConsolidated.swal.title2"),
			text: this.translate.instant("exams.publishExamsConsolidated.swal.text2"),
			icon: "success",
			showCancelButton: false,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
		}).then((isConfirm) => {
			this.router.navigateByUrl("/main/exams/manage");
		});
	}

	publishEgroupError(err) {
		this.responseHandler.error(err, "publishEgroup()");
		this.showLoading = false;
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolData?.isSouthAfricaPrimarySchool
			|| this.schoolData?.isSouthAfricaSecondarySchool
			|| false
		);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
