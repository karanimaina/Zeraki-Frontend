import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-send-results",
	templateUrl: "./send-results.component.html",
	styleUrls: ["./send-results.component.scss"]
})
export class SendResultsComponent implements OnInit {

	routeParams: any = {};

	exam: any = {};
	criteria: any = 0;
	optional_msg: any = "";
	onlySendAdditionalText = false;
	grades_length: any = 0;
	streamid: any = "";
	student: any;
	showLoading = false;
	schoolData: any;
	allStudents = true;
	spec_stream = false;
	spec_student = false;
	isSubmitted = false;

	constructor(
    private examService: ExamService,
    private toastService: HotToastService,
    private translate: TranslateService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute) { }

	ngOnInit(): void {
		// ?intakeid=19&seriesid=131
		this.route.params.subscribe((param: any) => {
			this.routeParams = param;
			this.loadExamDetails(param.intakeId, param.examId);
		});
		this.getSchoolData();
	}

	toggleRecipient(crit: number) {
		this.isSubmitted = false;
		this.criteria = crit;
		switch (crit) {
		case 0:
			this.allStudents = true;
			this.spec_stream = false;
			this.spec_student = false;
			break;
		case 1:
			this.allStudents = false;
			this.spec_stream = true;
			this.spec_student = false;
			break;
		case 2:
			this.allStudents = false;
			this.spec_stream = false;
			this.spec_student = true;
			break;

		default:
			this.allStudents = true;
			this.spec_stream = false;
			this.spec_student = false;
			break;
		}
	}

	getSchoolData() {
		this.dataService.schoolData.subscribe(resp => {
			this.schoolData = resp;
		});
	}

	loadExamDetails(intake: any, examId: any) {
		const param = "?intakeid=" + intake + "&seriesid=" + examId;
		this.examService.getSendSmsSeriesInfo(param).subscribe(
			(res) => {
				this.exam = res;
				this.setUpData();
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	setUpData() {
		if (this.exam != null && this.exam.grades != null && this.exam.grades.length > 0) {
			this.exam.grades.forEach((g: any, i: any) => {
				g.selected = true;
			});
			this.grades_length = this.exam.grades.length;
		}
	}

	sendResults() {
		this.isSubmitted = true;
		if (this.spec_stream && !this.streamid) {
			this.toastService.error(this.translate.instant("exams.sendResults.textStreamRequired"));
			return;
		}else if (this.spec_student && !this.student) {
			this.toastService.error(this.translate.instant("exams.sendResults.textStudentRequired"));
			return;
		}

		console.warn("clicked >> ");
		let error_status = false;
		if (this.optional_msg == null) {
			this.optional_msg = "";
		}
		this.optional_msg = this.optional_msg.trim();
		const url = "/analytics/sms/results";
		let params = "?optional_msg_only=" + this.onlySendAdditionalText;
		if (this.exam.seriesid != undefined) {
			params += "&seriesid=" + this.exam.seriesid;
		} else if (this.exam.egroupid != undefined) {
			params += "&egroupid=" + this.exam.egroupid;
		}

		params += "&current_intakeid=" + this.routeParams.intakeId;
		if (this.criteria == 0) {
			params += "&intakeid=" + this.exam.intakeid;
		} else if (this.criteria == 1) {
			params += "&streamid=" + this.streamid;
		} else if (this.criteria == 2) {
			params += "&userid=" + this.student.userid;
		}

		if (this.onlySendAdditionalText && this.optional_msg.length == 0) {
			const errorMsg = this.translate.instant("exams.sendResults.toastMessages.optionalMessageWarning");
			const m = errorMsg;
			this.toastService.warning(m);
			error_status = true;
		}

		const param_options = { optional_msg: this.optional_msg, grades: [] };
		if ((this.criteria == 0 || this.criteria == 1) && this.grades_length > 0) {
			const selected_grades: any = [];
			this.exam.grades.forEach((g: any, i: any) => {

				if (g.selected) {
					selected_grades.push(g.grade);
				}
			});
			if (selected_grades.length == 0) {
				const errorMsg = this.translate.instant("exams.sendResults.toastMessages.minGradeWarning");
				const m = errorMsg;
				this.toastService.warning(m);
				error_status = true;
			} else {
				param_options.grades = selected_grades;
				error_status = false;
			}
		}
		// console.warn("error_status", error_status);
		// console.warn("this.student >> ", this.student);
		// console.warn("params >> ", params);

		if (!error_status) {
			this.showLoading = true;
			this.examService.sendExamOptions(url + params, param_options).subscribe(
				(res) => {
					this.isSubmitted = false;
					Swal.fire({
						// title: "SMS send Success",
						// text: "Results have been sent successfuly",
						title: this.translate.instant("exams.sendResultsConsolidated.swal.title"),
						text: this.translate.instant("exams.sendResultsConsolidated.swal.text"),
						icon: "success",
						confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose")
					}).then((isconfirm) => {
						this.router.navigateByUrl("/main/exams/manage");
						this.showLoading = false;
					});
				}, (err) => {
					this.isSubmitted = false;
					this.toastService.error(err.error.message);
					this.showLoading = false;
				}, () => {
					this.showLoading = false;
				}
			);
		}
	}

}
