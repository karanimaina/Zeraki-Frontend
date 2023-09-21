import { Component, OnInit, ViewChild } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-deleted-exams",
	templateUrl: "./deleted-exams.component.html",
	styleUrls: ["./deleted-exams.component.scss"]
})
export class DeletedExamsComponent implements OnInit {

	@ViewChild("confirmDelete") deleteAlert: any;
	@ViewChild("confirmRecover") recoverAlert: any;

	deletedExams: any = null;
	loadingDeletedExams = false;
	deletedOrdinary: any[] = [];
	deletedKCSE: any[] = [];
	selectedExam: any;
	selectedExamName = "";
	selectedExamId: any = null;
	schoolInfo: any;
	schoolTypeData?: SchoolTypeData;


	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.loadSchoolInit();
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeData = resp;
		});
	}

	loadSchoolInit() {
		this.loadingDeletedExams = true;
		this.examService.init().subscribe(
			(res) => {
				this.schoolInfo = res;
				this.loadDeletedExams(res.schools[0].schoolid);
			},
			() => {
				console.log("error");
				this.loadingDeletedExams = false;
			}
		);
	}

	loadDeletedExams(id: number) {

		this.examService.getDeletedExams(id).subscribe(
			(res) => {
				this.deletedExams = res;

				//if (res.hasOwnProperty("deletedExams")) {
				if (Object.prototype.hasOwnProperty.call(res, "deletedExams")) {
					this.deletedExams = res.deletedExams;
					this.sortDeletedExams();

				} else {
					this.deletedKCSE = [];
					this.deletedOrdinary = [];
				}
				this.loadingDeletedExams = false;
			},
			() => {
				console.log("error");
				this.loadingDeletedExams = false;

			},
			() => {
				this.loadingDeletedExams = false;
			}
		);
	}

	sortDeletedExams() {
		this.deletedOrdinary = [];
		this.deletedKCSE = [];
		if (this.deletedExams !== null) {
			for (let i = 0; i < this.deletedExams.length; i++) {
				const deleted_exam = this.deletedExams[i];
				for (let j = 0; j < deleted_exam.exams.length; j++) {

					const exam = deleted_exam.exams[j];
					////console.log(exam);
					if (exam.type === "Ordinary") {
						this.deletedOrdinary.push({
							academicYear: deleted_exam.academicYear,
							term: deleted_exam.term,
							termName: deleted_exam.term,
							exam
						});
					}
					if (exam.type === "KCSE") {
						this.deletedKCSE.push({
							academicYear: deleted_exam.academicYear,
							term: deleted_exam.term,
							termName: deleted_exam.term,
							exam
						});
					}
				}
				// console.log(this.deletedOrdinary)
			}
		}
	}

	recoverDeletedExam(exam: any) {
		this.selectedExam = exam;
		this.selectedExamName = `${exam.exam.forms[0].formName} ${exam.exam.examName}`;
		this.selectedExamId = exam.exam.forms[0].scID;
		console.log(this.selectedExam);

		Swal.fire({
			title: this.translate.instant("exams.deletedExams.alertConfirmRecoverTitle"),
			text: this.translate.instant("exams.deletedExams.alertConfirmRecoverText", {exam:this.selectedExamName}),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "No",
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.recoverExam();
			}
		});
	}

	removeDeletedExam(exam: any) {
		console.warn(exam);
		this.selectedExam = exam;
		this.selectedExamName = `${exam.exam.forms[0].formName} ${exam.exam.examName}`;
		this.selectedExamId = exam.exam.forms[0].scID;
		// this.deleteAlert.fire();
		Swal.fire({
			title: this.translate.instant("exams.deletedExams.alertConfirmDeleteTitle"),
			text: this.translate.instant("exams.deletedExams.alertConfirmDeleteText", {exam:this.selectedExamName}),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "No",
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.deleteExam();
			}
		});
	}

	recoverExam() {
		const params = "?seriesClassId=" + this.selectedExamId;
		this.examService.recoverDeletedExam(params).subscribe(
			(res) => {
				this.loadDeletedExams(this.schoolInfo.schools[0].schoolid);
				console.log(res.response.message);

				const message = this.translate.instant("exams.deletedExams.toastMessages.recoverExamSuccess");
				this.toastService.success(message);

			}, () => {
				const message = this.translate.instant("exams.deletedExams.toastMessages.recoverExamError", { examName: this.selectedExamName });
				this.toastService.error(message);
			}
		);
	}

	deleteExam() {
		const params = "?isExamSeries=1&examId=" + this.selectedExamId;
		this.examService.deleteExamPermanently(params).subscribe(
			(res) => {
				console.log(res);

				const message = this.translate.instant("exams.deletedExams.toastMessages.deleteExamSuccess");
				this.toastService.success(message);

				this.loadDeletedExams(this.schoolInfo.schools[0].schoolid);
			}, () => {
				const message = this.translate.instant("exams.deletedExams.toastMessages.deleteExamError", { examName: this.selectedExamName });
				this.toastService.error(message);
			}
		);
	}

}
