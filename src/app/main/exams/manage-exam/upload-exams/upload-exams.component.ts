import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExcelTemplateHeader } from "src/app/@core/models/excel/excel-template-header";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

interface UploadFileError {
	title: string,
	msg: Array<string>,
	allowed_headers?: Array<{ column: string, meaning: string }>
}

@Component({
	selector: "app-upload-exams",
	templateUrl: "./upload-exams.component.html",
	styleUrls: ["./upload-exams.component.scss"]
})
export class UploadExamsComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	intakeId: any;
	exams: any;
	subjects: any[] = [];
	formStreams: any[] = [];
	members: any;
	intakeInfo: any;

	uploadedResults: any[] = [];
	// uploadedResultsHeader: any;
	expectedHeaders: any[] = [];
	sheet_headers: any[] = [];

	schoolTypeData?: SchoolTypeData;
	selectedExam: any;
	pathParams: any;
	selectedExamDetails: any;
	upload_results_success_status = false;
	error_exam: any;
	error_msg: any;
	only_missing_streams = true;
	custom_errors: any[] = [];
	showAutoStreamsButton = false;
	showLoading = false;
	exam: any;
	rightSidebar = false;
	isHistoricalData: any;
	autoStreams = false;
	all_forms_list: any[] = [];
	uploadBy = 1;
	sortBy = "ADMNO_ORDER";
	uploadByAdmno = 1;
	uploadByIndexno = 2;
	uploadingContent = false;

	translatedHeaders: Array<ExcelTemplateHeader> = [];

	constructor(
		private route: ActivatedRoute,
		private examService: ExamService,
		private dataService: DataService,
		private router: Router,
		private toastService: HotToastService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe((param) => {
			this.intakeId = param["intakeId"];
			this.pathParams = param;
			this.loadExams(this.intakeId);
			this.loadSubjects(this.intakeId);

			this.loadSchoolStreams();
			this.loadShoolTypeData();
			this.initBoolean();
		});
	}

	loadExams(intake: any) {
		this.examService.getExamsforUpload(intake).subscribe({
			next: (res) => {
				this.exams = res;
				this.selectedExam = this.pathParams.seriesId;
				this.examChange();
				this.loadIntakeInfo(intake);
			},
			error: (err) => this.responseHandler.error(err, "loadExams()"),
		});
	}

	loadSubjects(intake: any) {
		this.examService.getIntakeSubjects(intake).subscribe({
			next: (res) => {
				this.subjects = res.subjects;
				this.setHeaders();
			},
			error: (err) => this.responseHandler.error(err, "loadSubjects()"),
		});
	}

	loadShoolTypeData() {
		this.dataService.schoolData.subscribe({
			next: (res) => {
				this.schoolTypeData = res;
				this.all_forms_list = [];
				this.schoolTypeData?.current_forms_list?.forEach((form: any) => {
					this.all_forms_list.push(form);
				});
				this.schoolTypeData?.graduated_forms_list?.forEach((form: any) => {
					this.all_forms_list.push(form);
				});

				this.loadIntakeMembers(this.intakeId);
			},
			error: (err) => this.responseHandler.error(err, "loadShoolTypeData()"),
		});
	}

	loadIntakeMembers(intake: any) {
		const isSouthAfricanSchool = this.schoolTypeData?.isSouthAfricaPrimarySchool || this.schoolTypeData?.isSouthAfricaSecondarySchool;

		this.examService.getIntakeMembers(intake, !isSouthAfricanSchool).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res) => this.members = res,
			error: (err) => this.responseHandler.error(err, "loadIntakeMembers()"),
		});
	}

	loadSchoolStreams() {
		this.examService.getSchoolStreams().pipe(takeUntil(this.destroy$)).subscribe({
			next: (res) => this.formStreams = res,
			error: (err) => this.responseHandler.error(err, "loadSchoolStreams()"),
		});
	}


	loadIntakeInfo(intake: any) {
		this.examService.getBasicDetails(intake).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res) => {
				this.intakeInfo = res;
				this.setIsHistorical();
			},
			error: (err) => this.responseHandler.error(err, "loadIntakeInfo()"),
		});
	}

	examChange() {
		this.exams.forEach((exam: any) => {
			if (exam.seriesid == this.selectedExam) this.selectedExamDetails = exam;
		});
	}

	generateUploadExcel() {
		this.examService.generateUploadResultsExcel(this.subjects, this.members);
	}

	showErrorMessages = false;
	fileErrors: any = {};

	initBoolean() {
		this.upload_results_success_status = false;
		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.only_missing_streams = true;
		this.showAutoStreamsButton = false;
		this.showErrorMessages = false;
	}

	processFile() {
		this.initBoolean();
		this.showLoading = true;
		const headerError: UploadFileError = { title: "Invalid data", msg: [], allowed_headers: [] };

		if (this.schoolTypeData?.possible_forms_list.indexOf(this.selectedExamDetails.exam_form.toString()) == -1) {
			this.error_exam = true;

			headerError.msg.push("Invalid Class. Please specify a valid class");
			this.custom_errors.push(headerError);
			this.rightSidebar = true;
			this.showLoading = false;
		} else {
			const listOfAdms: any[] = [];
			const streams_list: any[] = [];

			if (this.headerErrors.length > 0) {
				this.setHeaderErrors(this.headerErrors);
				return;
			}

			const data = this.uploadedResults;
			const subjects = this.subjects;
			const out_of_value = 100;
			data.forEach((dt: any, i: any) => {
				const error: any = { msg: [] };
				let identification = (i + 1);
				if (dt.NAME !== undefined) {
					identification = identification + " (" + dt.NAME + ")";
				}

				subjects.forEach((subject: any) => {
					const subject_marks = dt[subject.textCode];
					if (subject_marks !== undefined && subject_marks !== null) {
						if (subject_marks.length !== undefined && !(subject_marks.length > 0)) {
							delete dt[subject.textCode];
						} else if (subject_marks < 0 || subject_marks > out_of_value) {
							const msg = "Has invalid " + subject.name + " marks";
							if (error.title === undefined) {
								error.title = "Student " + identification;
							}
							error.msg.push(msg);
							this.only_missing_streams = false;
						}
					}
					if (subject_marks == null) {
						delete dt[subject.textCode];
					}
				});
				//
				if (this.uploadBy == this.uploadByAdmno) {

					if (dt.ADMNO === undefined || dt.ADMNO === null || (typeof dt.ADMNO == "string" && dt.ADMNO.trim().length === 0)) {
						const msg = "Does not have an ADMISSION NUMBER";
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
						this.only_missing_streams = false;
					} else {
						if (typeof dt.ADMNO == "string") {
							dt.ADMNO = dt.ADMNO.trim();
						}
						data.forEach((s: any, j: any) => {
							if (j !== i && s.ADMNO !== undefined && s.ADMNO !== null && (typeof s.ADMNO == "string" && s.ADMNO.trim().length > 0)) {
								if (typeof s.ADMNO == "string") {
									s.ADMNO = s.ADMNO.trim();
								}
								if (dt.ADMNO === s.ADMNO) {
									const msg = "Admission Number is the same as that of student " + (j + 1);
									if (error.title === undefined) {
										error.title = "Student " + identification;
									}
									error.msg.push(msg);
									this.only_missing_streams = false;
								}
							}
						});
					}
				}

				if (this.isHistoricalData) {
					if (!dt.STREAM) {
						const msg = "Doesn't have a stream assigned";
						if (!error.title) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
						this.only_missing_streams = false;
					} else {
						dt.STREAM = dt.STREAM.trim();
						let stream_exists = false;
						// console.log(this.formStreams)
						if (this.formStreams[this.intakeInfo.form] !== undefined) {
						// console.log(this.formStreams[this.intakeInfo.form])
							if (streams_list.length === 0) {
								this.formStreams[this.intakeInfo.form].forEach((stream: any) => {
									streams_list.push(stream.trim().toLowerCase());
								});
							}
							for (let j = 0; j < streams_list.length; j++) {
								if (streams_list[j] == dt.STREAM.trim().toLowerCase()) {
									stream_exists = true;
								}
							}
						}
						if (!stream_exists) {
							const msg = "The stream assigned (" + dt.STREAM + ") does not exist";
							if (error.title === undefined) {
								error.title = "Student " + identification;
							}
							error.msg.push(msg);
						}
					}
				}

				if (error?.title && error.msg.length > 0) {
					this.custom_errors.push(error);
				}

			});
			if (this.isHistoricalData) {
				if (this.custom_errors.length > 0) {
					this.showAutoStreamsButton = this.only_missing_streams;
				} else {
					this.autoStreams = true;
				}
			}

			if (this.custom_errors.length > 0 && !this.only_missing_streams) {
				this.rightSidebar = true;
				this.showLoading = false;
			} else {
				if (this.isHistoricalData && this.only_missing_streams && !this.autoStreams) {

					Swal.fire({
						title: this.translate.instant("exams.uploadExams.swal.title"),
						text: this.translate.instant("exams.uploadExams.swal.text"),
						icon: "warning",
						showCancelButton: false,
						confirmButtonColor: "#43ab49",
						cancelButtonColor: "#ff562f",
						confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
					}).then(() => {
						this.showLoading = false;
					});
					this.rightSidebar = true;
					this.showLoading = false;
				} else {
				//check for errors
					(this.custom_errors.length > 0) ? this.rightSidebar = true : this.rightSidebar = false;
					if (this.custom_errors.length == 0) {
						Swal.fire({
							title: this.translate.instant("exams.uploadExams.swal.title2"),
							text: this.translate.instant("exams.uploadExams.swal.text2"),
							icon: "warning",
							showCancelButton: true,
							confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
							cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
							confirmButtonColor: "#43ab49",
							cancelButtonColor: "#ff562f",
						}).then((isConfirm) => {
							if (isConfirm.isConfirmed) {
							// get the strings only
								data.forEach((dt: any) => {

									const dt_temp = JSON.parse(JSON.stringify(dt));
									delete dt_temp.NAME;
									// var lowercase_dt = custom_jsObject_keysToLowerCase(dt_temp);
									Object.keys(dt_temp).map(key => {
										if (key.toLowerCase() != key) {
											dt_temp[key.toLowerCase()] = dt_temp[key];
											delete dt_temp[key];
										}
									});
									listOfAdms.push(dt_temp);
								});
								let params = "/form/" + this.intakeInfo.form + "/" + this.selectedExamDetails.seriesid + "?intakeid=" + this.selectedExamDetails.intakeid;
								if (this.uploadBy == this.uploadByIndexno) {
									params += "&upload_by_indexno=true";
								}
								// all set
								this.uploadingContent = true;
								this.examService.uploadExamResults(params, listOfAdms).subscribe(
									(res) => {
										this.uploadingContent = false;
										Swal.fire({
											title: this.translate.instant("exams.uploadExams.swal.title3"),
											text: `${res.message}`,
											icon: "success",
											showCancelButton: false,
											confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose"),
											cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
											confirmButtonColor: "#43ab49",
											cancelButtonColor: "#ff562f",
										}).then(() => {
											this.router.navigateByUrl("/main/exams/manage");
										});
									}, (err) => {
										this.uploadingContent = false;
										if (err.status == 422) {
											this.custom_errors = err.error;
											this.rightSidebar = true;
										} else {
											const message = this.translate.instant("common.toastMessages.anErrorOccurred");
											this.toastService.error(message);
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
		// }
	}

	setIsHistorical() {
		if (this.selectedExamDetails != null && this.selectedExamDetails.exam_form != null) {

			if (this.intakeInfo.form == this.selectedExamDetails.exam_form) {
				this.isHistoricalData = false;
			} else {
				this.isHistoricalData = true;
			}
		}
	}

	get commonHeaders() {
		const columnHeaderTranslations = ["admissionNumber", "name", "stream"];

		return columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.uploadExams.excelTemplateDownload.workSheetColumnHeaders.${item}`);

			return columnHeaderName.toUpperCase();
		});
	}

	setHeaders() {
		this.expectedHeaders = this.commonHeaders;
		this.subjects.forEach((subject: any) => {
			this.expectedHeaders.push(subject.textCode.toString());
		});
	}

	updatedExcelHeaders(headers: Array<ExcelTemplateHeader>) {
		this.translatedHeaders = headers;
	}

	// Excel implementation
	get excelTemplateHeaders(): ExcelTemplateHeader[] {
		return [
			// the 'key' refers to translation keys in as in en.json
			{
				key: "admno",
				value: "ADMNO",
				width: 20,
				meaning: this.translate.instant("common.admno"),
				translate: true
			},
			{
				key: "name",
				value: "NAME",
				width: 20,
				meaning: this.translate.instant("common.studentName"),
				translate: true
			},
			{
				key: "stream",
				value: "STREAM",
				meaning: this.translate.instant("common.studentStream"),
				translate: true
			},
			...this.subjectColumns
		];
	}

	get subjectColumns(): Array<ExcelTemplateHeader> {
		return this.subjects!.map((subject: any) => {
			return (
				{
					key: subject.textCode.toString(),
					value: subject.textCode.toString(),
					displayValue: BasicUtils.displayValue(subject.textCode.toString()),
					type: "marks",
					width: 10,
					meaning: subject.name,
				}
			);
		});
	}

	get defaultExcelEntries() {
		return this.members?.map(student => ({
			admno: student.admno,
			name: student.name,
			stream: student.stream
		}));
	}

	readUploadedStudentMarks(uploadedStudentMarks: Array<any>) {

		const cleanMarks = [...uploadedStudentMarks];

		cleanMarks.forEach(studentData => {
			for (const [key, value] of Object.entries(studentData)) {
				if (this.convertKey(key, value)) {
					studentData[`${key}_grade`] = value;
					delete studentData[key];
				}
			}
		});

		this.uploadedResults = cleanMarks;
	}

	convertKey(key: any, value: any): boolean {
		if (
			(value == "X" || value == "Y")
			&&
			(key.toLowerCase().trim() != this.translate.instant("workSheet.headers.admno"))
			&&
			(key.toLowerCase().trim() != this.translate.instant("workSheet.headers.name"))
			&&
			(key.toLowerCase().trim() != this.translate.instant("workSheet.headers.stream"))
		) return true;

		return false;
	}

	headerErrors: Array<string> = [];
	setHeaderErrors(errors: Array<string>) {
		this.headerErrors = errors;
		this.rightSidebar = false;
		this.addHeaderErrors(this.headerErrors);
	}

	addHeaderErrors(errors: Array<any>) {
		this.custom_errors = [];
		if (errors.length > 0) {
			const headerError: { title: string, msg: Array<any>, allowedHeaders: Array<any> } = { title: "", msg: [], allowedHeaders: [] };
			headerError.title = "Forbidden Columns";
			headerError.msg.push(`The uploaded document contains the following forbidden columns: ${errors.toString()}`);
			headerError.allowedHeaders = this.translatedHeaders;
			this.custom_errors.push(headerError);
			this.rightSidebar = true;
			this.showLoading = false;
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
