import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";

enum ExamStatus {
	RELEASED = 5,
	PUBLISHED_SERIES = 2,
	PENDING_PUBLISH = 1,
	UPLOAD_RESULTS = 0,
	PENDING_PUBLISH_EGROUP = 0,
	PUBLISHED_EGROUP = 4,
}

enum ExamTypes {
	SERIES = 0,
	EGROUP = 1,
	YEAR_AVERAGE = 2
}

@Component({
	selector: "app-exams-list",
	templateUrl: "./exams-list.component.html",
	styleUrls: ["./exams-list.component.scss"]
})
export class ExamsListComponent implements OnInit {
	@Input() examList: any;
	@Input() isReleaseExamEnabled = false;
	@Input() schoolTypeData!: SchoolTypeData;
	@Output() onSelectedExam: EventEmitter<any> = new EventEmitter<any>();
	@Output() onLoadExamList: EventEmitter<any> = new EventEmitter<any>();
	@Output() onAcademicYearChange: EventEmitter<any> = new EventEmitter<any>();

	examToDeleteExamId: any = "";
	examToDeleteIntakeId: any = "";
	examToDeleteExamName = "";
	examToDeleteType: any;
	readonly ExamStatus = ExamStatus;
	readonly ExamTypes = ExamTypes;
	userRoles?: Role;

	constructor(
		private translate: TranslateService,
		private examService: ExamService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private rolesService: RolesService
	) { }

	ngOnInit(): void {
		this.getUserRoles();
	}

	private getUserRoles(): void {
		this.rolesService.roleSubject.subscribe(
			userRoles => {
				this.userRoles = userRoles;
			}
		);
	}

	get showDeleteExamBtn(): boolean {
		if (!this.schoolTypeData?.hasSuperAdmins) return true;
		if (this.userRoles?.isSuperAdmin) return true;

		return false;
	}

	handleSelectExam(exam: any) {
		this.onSelectedExam.emit(exam);
	}

	deleteExam(type: any, examid: any, intakeid: any, examname: any) {
		this.examToDeleteExamId = examid;
		this.examToDeleteType = type;
		this.examToDeleteExamName = examname;
		this.examToDeleteIntakeId = intakeid;
		// this.deleteAlert.fire()
		Swal.fire({
			title: this.translate.instant("exams.manageExams.swal.title"),
			text: this.translate.instant("exams.manageExams.swal.text", { name: this.examToDeleteExamName }),
			icon: "warning",
			showCancelButton: true
		}).then((isConfirm) => {

			if (isConfirm.isConfirmed) {
				this.isDeleteExam();
			}
		});
	}

	isDeleteExam() {
		let typename = "series";
		let isSeriesOrConsolidated = true;
		if (this.examToDeleteType == 1) {
			typename = "egroup";
		}
		if (this.examToDeleteType == 2) {
			typename = "annual_egroup";
			isSeriesOrConsolidated = false;
		}
		const params = "" + typename + "/" + this.examToDeleteExamId + (isSeriesOrConsolidated ? "/-1" : "") + "?intakeid=" + this.examToDeleteIntakeId;
		this.examService.deleteExam(params).subscribe({
			next: (res) => {
				console.log(res.message);

				const message = this.translate.instant("exams.manageExams.toastMessages.examDeleted");
				this.toastService.success(message);

				this.onLoadExamList.emit();
			},
			error: err => {
				this.responseHandler.error(err, "isDeleteExam()");
			}
		});
	}

	handleUnpublishExam(type: number, examid: number, intakeid: number, examname: string) {

		Swal.fire({
			title: this.translate.instant("exams.manageExams.swal.title2"),
			text: this.translate.instant("exams.manageExams.swal.text2", { name: examname }),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
		}).then((result) => {
			if (result.isConfirmed) {
				let typename = "series";
				let isSeriesOrConsolidated = true;
				if (type == 1) {
					typename = "egroup";
				}
				if (type == 2) {
					typename = "annual_egroup";
					isSeriesOrConsolidated = false;
				}
				const url = "/results/" + typename + "/unpublish/" + examid + (isSeriesOrConsolidated ? "/-1" : "") + "?intakeid=" + intakeid;
				this.examService.unpublishExam(url, isSeriesOrConsolidated).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("exams.manageExams.toastMessages.unpublishSuccess");
						this.toastService.success(message);

						this.onAcademicYearChange.emit();
					}, (err) => {
						this.responseHandler.error(err, "unpublishExam()");
					}
				);
			}
		});
	}

	handleReleaseExam(type: number, examid: number, intakeid: number, examname: string) {

		Swal.fire({
			title: this.translate.instant("exams.manageExams.swal.release.release.title"),
			text: this.translate.instant("exams.manageExams.swal.release.release.confirmText", { name: examname }),
			icon: "question",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
		}).then((result) => {
			if (result.isConfirmed) {
				let typeName = "";
				let params = "";
				if (type != 0) {
					typeName = "/examgroup";
					params = `?egroupId=${examid}&intakeId=${intakeid}`;
				} else {
					params = `?seriesId=${examid}&intakeId=${intakeid}`;
				}
				this.examService.releaseExam(typeName, params).subscribe(
					(res) => {

						this.responseHandler.success(res);
						this.onAcademicYearChange.emit();
					}, (err) => {
						this.responseHandler.error(err, "handleReleaseExam()");
					}
				);
			}
		});
	}


	handleUnreleaseExam(type: number, examid: number, intakeid: number, examname: string) {
		Swal.fire({
			title: this.translate.instant("exams.manageExams.swal.release.unrelease.title"),
			text: this.translate.instant("exams.manageExams.swal.release.unrelease.confirmText", { name: examname }),
			icon: "question",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
		}).then((result) => {
			if (result.isConfirmed) {
				let typeName = "";
				let params = "";
				if (type != 0) {
					typeName = "/examgroup";
					params = `?egroupId=${examid}&intakeId=${intakeid}`;
				} else {
					params = `?seriesId=${examid}&intakeId=${intakeid}`;
				}
				this.examService.unreleaseExam(typeName, params).subscribe(
					(res) => {

						this.responseHandler.success(res);
						this.onAcademicYearChange.emit();
					}, (err) => {
						this.responseHandler.error(err, "handleReleaseExam()");
					}
				);
			}
		});
	}


}
