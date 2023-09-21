import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";


@Component({
	selector: "app-kcse-exams",
	templateUrl: "./kcse-exams.component.html",
	styleUrls: ["./kcse-exams.component.scss"]
})
export class KcseExamsComponent implements OnInit {


	kcseForm!: FormGroup;

	schoolIntakes: any = {};
	kcseYear: any = "";
	kcseExam = "KCSE";
	isHasKcseExam = false;
	intakeSubjects: any;

	uploadedKcseResults: any[] = [];
	uploadedKcseResultsHeaders: any;
	expectedKcseResultHeaders: any[] = [];
	allowedKcseResultsHeaders: any[] = [];
	uploadedPreviousKcseSubjectMeanPoints: any[] = [];
	uploadedPreviousKcseSubjectMeanPointsHeaders: any;

	fileErrors: any = {};

	showErrorMessages = false;
	add_exam_success: any;
	error_exam = false;
	error_msg: any;
	custom_errors: any[] = [];
	only_missing_streams = false;
	showAutoStreamsButton = false;
	rightSidebar = false;
	showLoading = false;
	uploadingContent = false;

	constructor(
		private examService: ExamService,
		private router: Router,
		private toastService: HotToastService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.initForm();
		this.loadIntakes();
		this.loadKcseYear();

	}

	loadIntakes() {
		this.examService.getStreamIntakes().subscribe({
			next: (resp) => {
				this.schoolIntakes = resp;
			},
			error: (err) => {
				this.responseHandler.error(err, "loadIntakes()");
			}
		});
	}

	loadKcseYear() {
		this.examService.getKCSEYear().subscribe(
			(res) => {
				this.kcseYear = res;
				this.kcseForm.addControl("kcseYear", new FormControl(res));
			}, (err) => {
				this.responseHandler.error(err, "loadKcseYear()");
			}
		);
	}

	loadGaduationYear(intakeId: number) {
		this.examService.getGraduationYear(intakeId).subscribe(
			(res) => {
				this.kcseYear = res;
				this.kcseForm.get("kcseYear")?.setValue(this.kcseYear);
				// this.kcseForm.value.kcseYear = this.kcseYear;
				console.warn(this.kcseForm.value.kcseYear, this.kcseYear);
				// this.kcseForm.addControl("kcseYear", new FormControl(res));
			}, (err) => {
				this.responseHandler.error(err, "loadGaduationYear()");
			}
		);
	}

	initForm() {
		this.kcseForm = new FormGroup({
			intake: new FormControl(""),
			kcseExam: new FormControl(this.kcseExam),
			// kcseYear: new FormControl(0)
		});
	}

	intakeSelected(): void {
		const intake = this.kcseForm.value.intake;
		// this.kcseForm.value.kcseYear = this.kcseYear;
		console.warn(intake);
		this.loadGaduationYear(intake);
		if (!(intake == "")) {
			this.examService.checkIntakeHasKsce(intake).subscribe(
				(res) => {
					// console.log(res);
					if (Object.keys(res).length > 0 && (res.noKCSE == true)) {
						this.isHasKcseExam = true;
						this.loadIntakeSubjects(intake);
					} else {
						this.isHasKcseExam = false;
					}

					// if (this.isHasKcseExam) {

					// }
				}, (err) => {
					this.responseHandler.error(err, "intakeSelected()");
				}
			);
		}
	}

	loadIntakeSubjects(intake: any): void {
		this.examService.getIntakeSubjects(intake).subscribe(
			(res) => {
				this.intakeSubjects = res;
				this.expectedKcseResultHeaders = ["INDEXNO", "NAME", "TOTAL_POINTS", "MEAN_GRADE"];
				this.allowedKcseResultsHeaders.push({ column: "INDEXNO", meaning: "Student Index Number" });
				this.allowedKcseResultsHeaders.push({ column: "NAME", meaning: "Student Name" });
				res.subjects.forEach((subject: any) => {
					this.expectedKcseResultHeaders.push(subject.textCode.toString());
					this.allowedKcseResultsHeaders.push({ column: subject.textCode, meaning: subject.name });
				});
				// console.log(this.intakeSubjects)
			}, (err) => {
				this.responseHandler.error(err, "loadIntakeSubjects()");
			}
		);
	}

	downloadPreviousKcseExcel() {
		this.uploadedPreviousKcseSubjectMeanPointsHeaders = this.examService.generatePreviousKcseExcel();
	}

	downloadKcseExcel() {
		const intake = this.kcseForm.value.intake;
		this.examService.getIntakeMembers(intake).subscribe(
			(res) => {
				this.uploadedKcseResultsHeaders = this.examService.generateKcseExcel(this.intakeSubjects.subjects, res);
			}, (err) => {
				this.responseHandler.error(err, "downloadKcseExcel()");
			}
		);
	}

	readPreviousExcelData(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		// event.target.files.length == 1? this.isFileSelected = true: this.isFileSelected = false;
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
			this.uploadedPreviousKcseSubjectMeanPoints = XLSX.utils.sheet_to_json(ws, { header: 2 });
			this.uploadedPreviousKcseSubjectMeanPointsHeaders = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];
		};
		reader.readAsArrayBuffer(target.files[0]);
	}

	readKcseExcelData(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		// event.target.files.length == 1? this.isFileSelected = true: this.isFileSelected = false;
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
			this.uploadedKcseResults = XLSX.utils.sheet_to_json(ws, { header: 2 });
			this.uploadedKcseResultsHeaders = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];
		};
		reader.readAsArrayBuffer(target.files[0]);
	}

	initBoolean() {

		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.only_missing_streams = true;
		this.showAutoStreamsButton = false;
		this.rightSidebar = false;
	}

	processFile() {
		console.warn("this.uploadedPreviousKcseSubjectMeanPoints >> ", this.uploadedPreviousKcseSubjectMeanPoints);
		this.initBoolean();
		this.showLoading = true;
		const listOfAdms: any[] = [];
		let has_header_error = false;
		let header_error_text = "The uploaded document contains the following forbidden columns: ";
		const header_error: any = { msg: [], allowed_headers: [] };
		const allowed_headers = this.allowedKcseResultsHeaders;
		header_error.title = "Forbidden Columns";
		this.uploadedKcseResultsHeaders.forEach((sh: any) => {
			let header_exists = false;
			this.expectedKcseResultHeaders.forEach((ht: any) => {
				if (sh.trim().toLowerCase() == ht.trim().toLowerCase()) {
					header_exists = true;
				}
			});
			if (!header_exists) {
				if (has_header_error) {
					header_error_text += ", " + sh;
				} else {
					header_error_text += sh;
				}
				has_header_error = true;
			}
		});
		if (has_header_error) {
			console.warn("header_error_text >> ", header_error_text);
			header_error.msg.push(header_error_text);
			header_error.allowed_headers = allowed_headers;
			this.custom_errors.push(header_error);
			this.rightSidebar = true;
			this.showLoading = false;
		} else {
			let subject_means_found = false;
			const previous_mean_years: number[] = [];
			const subjectMeanData = this.uploadedPreviousKcseSubjectMeanPoints;
			const sheet_headers_subject_means = this.uploadedPreviousKcseSubjectMeanPointsHeaders;
			if (subjectMeanData != null && subjectMeanData != undefined && subjectMeanData.length > 0) {
				sheet_headers_subject_means.forEach((header_name: string, i: number) => {
					const error: any = { msg: [] };
					if (i == 0 && header_name != "SUBJECT") {
						const msg = "The subject mean's header 1 must be 'SUBJECT'";
						error.title = "Subject Means Header " + (i + 1) + " (" + header_name + ")";
						error.msg.push(msg);
					} else if (i != 0) {
						//var num = $scope.getCleanedNumber(header_name);
						const num = Number(header_name);
						if (num > 2005 && num < 2022) {
							////////////console.log("good");
							previous_mean_years.push(num);
						} else {
							////////////console.log("bad");
							const msg = "The subject mean's header " + (i + 1) + " must be a year that's greater than 2005 and less than 2021";
							error.title = "Subject Means Header " + (i + 1) + " (" + header_name + ")";
							error.msg.push(msg);
						}
					}
					if (error?.title && error?.msg?.length > 0) {
						this.custom_errors.push(error);
					}
				});
				subjectMeanData.forEach((dt: any, j: any) => {

					// const subject_name = dt["SUBJECT"];
					sheet_headers_subject_means.forEach((header_name: any, i: any) => {


						const error: any = { msg: [] };
						const current_item = dt[header_name];
						if (i == 0) {
							if (current_item != "OVERALL" && !(this.expectedKcseResultHeaders.indexOf(current_item.toUpperCase()) > -1)) {
								const msg = "The code specified for subject " + (j + 1) + " (" + current_item + ") is NOT valid";
								if (error.title === undefined) {
									error.title = "Subject " + (j + 1) + " (" + current_item + ")";
								}
								error.msg.push(msg);
							}
						} else if (i != 0) {
							const num = Number(current_item);
							if (num >= 0 && num <= 12) {
								////////////console.log("good");
								subject_means_found = true;
							} else {
								////////////console.log("bad");
								/*var msg = "The " + subject_name + " mean specified for the year " + header_name + " must be between 0 and 12";
				 error.title = "Year " + header_name + " - " + subject_name;
				 error.msg.push(msg);*/
							}
						}

						if (error?.title && error?.msg?.length > 0) {
							this.custom_errors.push(error);
						}
					});
				});
			}
			const data = this.uploadedKcseResults;

			data.forEach((dt: any, i: number) => {

				const error: any = { msg: [] };
				let identification: any = (i + 1);
				if (dt.NAME !== undefined) {
					identification = identification + " (" + dt.NAME + ")";
				}

				const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E", "X", "Y"];

				this.intakeSubjects.subjects.forEach((subject: any) => {

					if (dt[subject.textCode] !== undefined && dt[subject.textCode] !== null) {
						if (typeof dt[subject.textCode] == "string") {
							dt[subject.textCode] = dt[subject.textCode].trim();
						}
					}
					const subject_grade = dt[subject.textCode];
					if (subject_grade !== undefined && subject_grade !== null && subject_grade.length > 0) {
						if (!(grades.indexOf(subject_grade.toUpperCase()) > -1)) {
							const msg = "Has invalid grade - " + subject.textCode + " '" + subject_grade + "'";
							if (error.title === undefined) {
								error.title = "Student " + identification;
							}
							error.msg.push(msg);
						}
					}
				});
				const check_mean_marks = true;
				if (check_mean_marks) {
					const MEAN_GRADE_CODE = "MEAN_GRADE";
					if (dt[MEAN_GRADE_CODE] !== undefined && dt[MEAN_GRADE_CODE] !== null) {
						dt[MEAN_GRADE_CODE] = dt[MEAN_GRADE_CODE].toString().trim();
					}
					const mean_grade = dt[MEAN_GRADE_CODE];
					if (mean_grade == undefined || mean_grade == null || !(mean_grade.length > 0)) {
						const msg = "Does not have a Mean Grade assigned";
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					} else if (mean_grade !== undefined && mean_grade !== null && mean_grade.length > 0) {
						if (!(grades.indexOf(mean_grade.toUpperCase()) > -1)) {
							const msg = "Has invalid Mean Grade";
							if (error.title === undefined) {
								error.title = "Student " + identification;
							}
							error.msg.push(msg);
						}
					}
				}

				if (dt.INDEXNO === undefined || dt.INDEXNO.toString().trim().length === 0) {
					const msg = "Does not have an INDEX NUMBER";
					if (error.title === undefined) {
						error.title = "Student " + identification;
					}
					error.msg.push(msg);
				} else {
					data.forEach((s: any, j: any) => {


						if (j !== i) {
							if (dt.INDEXNO === s.INDEXNO) {
								const msg = "Index Number is the same as that of student " + (j + 1);
								if (error.title === undefined) {
									error.title = "Student " + identification;
								}
								error.msg.push(msg);
							}
						}
					});
				}
				if (error?.title && error?.msg?.length > 0) {
					this.custom_errors.push(error);
				}
			});
			if (this.custom_errors.length > 0) {
				this.rightSidebar = true;
				this.showLoading = false;
			} else {
				Swal.fire({
					title: this.translate.instant("exams.kcseExams.swal.title"),
					text: this.translate.instant("exams.kcseExams.swal.text"),
					icon: "warning",
					showCancelButton: true,
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
					cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
					confirmButtonColor: "#43ab49",
					cancelButtonColor: "#ff562f",
				}).then((isConfirm) => {
					if (isConfirm.isConfirmed) {
						// get the strings only
						data.forEach((dt: any, i: any) => {
							const dt_temp = JSON.parse(JSON.stringify(dt));
							delete dt_temp.NAME;
							// var lowercase_dt = keysToLowerCase(dt_temp);
							Object.keys(dt_temp).map(key => {
								if (key.toLowerCase() != key) {
									dt_temp[key.toLowerCase()] = dt_temp[key];
									delete dt_temp[key];
								}
							});
							listOfAdms.push(dt_temp);
						});
						let params = "?intakeid=" + this.kcseForm.value.intake;
						if (subject_means_found) {
							console.warn("subjectMeanData >> ", subjectMeanData, previous_mean_years);
							params += "&previous_means=" + JSON.stringify(subjectMeanData) + "&previous_years=" + JSON.stringify(previous_mean_years);
						}
						this.uploadingContent = true;
						this.examService.uploadKcseExamResults(params, listOfAdms).subscribe(
							(res) => {
								this.uploadingContent = false;
								Swal.fire({
									title: this.translate.instant("exams.kcseExams.swal.title2"),
									text: `${res.message}`,
									icon: "success",
									showCancelButton: false,
									confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose"),
									cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
									confirmButtonColor: "#43ab49",
									cancelButtonColor: "#ff562f",
								}).then((result) => {
									this.router.navigateByUrl("/main/exams/manage");
								});
							}, (err) => {
								this.uploadingContent = false;
								if (err.status == 422) {
									if (err?.error?.message) {
										this.custom_errors = [
											{
												msg: [err.error.message]
											}
										];
									} else {
										this.custom_errors = err.error;
									}

									this.rightSidebar = true;
								}
							}
						);
					} else {
						this.showLoading = false;
					}

				});
			}
		}
	}

}
