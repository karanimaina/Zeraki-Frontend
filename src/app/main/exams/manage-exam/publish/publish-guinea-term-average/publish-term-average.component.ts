import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import Swal from "sweetalert2";
import { Observable } from "rxjs";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-publish-guinea-term-average",
	templateUrl: "./publish-term-average.component.html",
	styleUrls: ["./publish-term-average.component.scss"]
})
export class PublishGuineaTermAverageComponent implements OnInit {

	pathParams: any;
	mentions: any;
	previousExam: any = {};
	schoolData!: SchoolTypeData;
	isLoading = true;
	showLoading = false;
	selectedListExam: any;
	selectExamIndex: any;
	selectedListExamSubjects: any;
	list: any;
	basicDetails: any;
	selectedMention: any;
	upload_results_success_status!: boolean;
	error_exam!: boolean;
	error_msg!: string;
	custom_errors!: any[];
	only_missing_streams!: boolean;
	showAutoStreamsButton!: boolean;
	rightSidebar!: boolean;

	constructor(private examService: ExamService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private router: Router,
		private mentionService: MentionService,
		private errorHandler: ResponseHandlerService
	) {
	}

	ngOnInit(): void {
		this.pathParams = this.route.snapshot.params;
		this.loadMentions();
		this.loadSchoolData();
		const intakeId = this.pathParams.intakeId;
		this.loadPreviousExams(intakeId);
		this.loadExamsToPublishDean(intakeId);
		this.loadBasicDetails(intakeId);
		this.loadPreviousExams(intakeId);
	}

	loadMentions() {

		this.mentionService.getMentionsMapping().subscribe(
			{
				next: (res: any) => {
					this.mentions = res;
					this.selectedMention = (this.mentions && this.mentions.length == 1) ? res[0] : "-1";

				},
				error: (error) => {
					console.error(error.error);
				}
			});
	}

	loadSchoolData(): void {
		this.dataService.schoolData.subscribe(
			(res) => {
				this.schoolData = res;
			}
		);
	}

	loadPreviousExams(intake: any) {
		this.examService.getEgroupPublishExamPreviousExam(intake).subscribe(
			(res) => {
				this.previousExam = res;
			}, (err) => {
				this.errorHandler.error(err, "loadPreviousExams()");
			}
		);
	}

	loadExamsToPublishDean(intake: any) {

		this.isLoading = true;
		const fetchPublishExamList: Observable<any> = (this.pathParams.type == 1) ?
			this.examService.getEgroupPublishExamList(intake) :
			this.examService.getYearGroupPublishExamList(intake);

		fetchPublishExamList.subscribe(
			(res) => {
				this.list = res;
				res.list.forEach((exam: any, index: any) => {
					if (exam.examid == this.pathParams.examId) {
						this.selectedListExam = exam;
						this.selectExamIndex = index;
						this.selectedMention = exam.msid;
						this.selectedListExamSubjects = exam.subjects;
						this.selectedListExamSubjects.forEach((s: any, i: any) => {
							s.isPreview = (i == 0) ? true : false;
							s.msid = (this.mentions && this.mentions.length == 1) ? this.mentions[0].msid : this.selectedListExam.msid;
						});
						this.selectedListExam.subjects = this.selectedListExamSubjects;
					}
				});
				this.isLoading = false;
			}, (err) => {
				this.errorHandler.error(err, "loadExamsToPublishDean()");
				this.isLoading = false;
			}
		);
	}

	loadBasicDetails(intake: any) {
		this.examService.getBasicDetails(intake).subscribe(
			(res) => {
				this.basicDetails = res;
			}, (err) => {
				this.errorHandler.error(err, "loadBasicDetails()");
			}
		);
	}

	selectExam() {
		this.selectedListExam = this.list.list[this.selectExamIndex];
	}


	selected_gs: any = "";
	buttonClicked = false;
	publishTermAverage() {
		this.buttonClicked = true;
		this.initBoolean();
		const examId = this.selectedListExam.examid;
		const exam = this.selectedListExam;
		if (exam.msid >= 0) {
			this.selected_gs = exam.msid;
		}

		if (this.mentions != null && this.selectedMention != null) {
			this.selected_gs = this.selectedMention;
		}

		const subjectGS: any = {};
		const subjectGSErrors: any[] = [];
		this.selectedListExamSubjects.forEach((sgs: any, i: any) => {
			if (sgs.msid != null && sgs.msid != -1) {
				subjectGS[sgs.textCode] = +sgs.msid;
			} else {
				subjectGSErrors.push(sgs.name);
			}
		});

		// console.log("subjectGS >> ", subjectGS);



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

					let param = "?mention=" + this.selected_gs + "&subjectmention=" + JSON.stringify(subjectGS);

					param += "&intakeid=" + this.pathParams.intakeId;
					const url = "/" + examId + "/" + param;

					const publishObservable: Observable<any> = (this.pathParams.type == 1) ?
						this.examService.publishGuineaTermAverage(url) :
						this.examService.publishGuineaYearAverage(url);

					publishObservable.subscribe(
						(resp) => {
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
						}, (err) => {
							this.errorHandler.error(err, "publishTermAverage()");
							this.showLoading = false;
						}
					);
				}
			});

		}
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

}
