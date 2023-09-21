import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { Sort } from "@angular/material/sort";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { FormOrYearPipe } from "src/app/@core/shared";
import { takeUntil } from "rxjs/operators";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { UserInfo } from "src/app/@core/models/user-info";
import {DatePipe, Location} from "@angular/common";

@Component({
	selector: "app-publish-subject-status",
	templateUrl: "./publish-subject-status.component.html",
	styleUrls: ["./publish-subject-status.component.scss"],
	providers: [FormOrYearPipe, DatePipe]
})
export class PublishSubjectStatusComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	routeParams: any = {};
	examsToPublishAdmin: any;
	examsToPublish: any;
	results: any = { max: 0 };
	classid: any;

	sortType = "raw";
	sortReverse = true;
	showDeleteBox = false;
	select_all = false;
	locked_exam_all_deleted = false;
	lock_exam = false;
	viewonly = false;
	editByAdm = true;
	exam_temp: undefined;
	exam: any;
	out_of_temp: any;
	newResults: any[] = [];
	custom_errors: any;
	error_exam!: boolean;
	error_msg!: string;
	rightSidebar!: boolean;
	showLoading!: boolean;
	publish_success_status!: boolean;
	publish_title!: string;
	publish_msg!: string;

	schoolTypeData!: SchoolTypeData;
	userInfo!: UserInfo;

	isLoadingAdminExamsToPublish = false;
	isLoadingAdminExamResults = false;
	isLoadingResultsToPublishSubjectTeacher = false;

	get isLoading(): boolean {
		return (
			this.isLoadingAdminExamsToPublish ||
			this.isLoadingResultsToPublishSubjectTeacher
		);
	}

	get resultsDisplayName(): string {
		return `${this.formOrYearPipe.transform(this.schoolTypeData.formoryear)} ${
			this.results?.form
		} ${this.results?.stream} - ${this.results?.subject}`;
	}

	constructor(
		private route: ActivatedRoute,
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private formOrYearPipe: FormOrYearPipe,
		private dataService: DataService,
		private router: Router,
		private userService: UserService,
		private datePipe: DatePipe,
		private responseHandler: ResponseHandlerService,
		private location: Location
	) {}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.loadSchoolTypeData();
		this.initItems();
		this.initSaveResults();
		this.initLogic();
		this.route.params.subscribe((params) => {
			this.routeParams = params;
			this.loadAdminExamsToPublish();
			this.loadAdminExamResults();
			this.classid = this.routeParams.classId;
			this.viewonly = this.routeParams.viewonly == "1" ? true : false;
			this.lock_exam = this.routeParams.lock == "1" ? true : false;
		});
		this.getUser();
	}

	getUser() {
		this.userService.userInfoSubject.subscribe(user => {
			this.userInfo = user;
		});
	}

	loadSchoolTypeData() {
		this.dataService.schoolData.subscribe((res) => {
			this.schoolTypeData = res;
		});
	}

	loadAdminExamsToPublishAdmin() {
		if (this.routeParams.seriesId > 0 && this.routeParams.lock == 1) {
			this.getResultstoPublishSubjectTeacher(
				this.routeParams.classId,
				this.routeParams.seriesId,
				this.routeParams.viewonly
			);
		}
	}

	loadAdminExamsToPublish() {
		this.isLoadingAdminExamsToPublish = true;

		this.examService
			.loadAdminExamsToPublish(this.routeParams.classId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => {
					this.examsToPublish = resp;
					this.examsToPublishAdmin = resp;

					this.isLoadingAdminExamsToPublish = false;

					this.loadAdminExamsToPublishAdmin();
				},
				error: (err) => {
					this.isLoadingAdminExamsToPublish = false;
					this.responseHandler.error(err, "loadAdminExamsToPublish()");
				}
			});
	}

	examName: any = "";
	getResultstoPublishSubjectTeacher(
		classid: any,
		seriesid: any,
		viewonly: any
	) {
		this.isLoadingResultsToPublishSubjectTeacher = true;

		let params = "";
		if (seriesid && seriesid > 0) {
			params = "?seriesid=" + seriesid;
			if (viewonly != null && viewonly == 1) {
				params += "&viewonly=true";
			}
		}

		const url =
			`/results/unpublished/subjectteacher/${this.routeParams.classId}` +
			params;

		this.examService.doGet(url).subscribe(
			(res) => {
				this.examsToPublish = res;
				this.examsToPublishAdmin = res;
				this.examsToPublish.forEach((exam: any) => {
					if (exam.examid == this.routeParams.seriesId) {
						// this.exam_found = true;
						this.exam = exam.examid;
						this.examName = exam.exam_menu_name;
					}
				});

				this.isLoadingResultsToPublishSubjectTeacher = false;
			},
			() => {
				//console.log(err);
				this.isLoadingResultsToPublishSubjectTeacher = false;
			}
		);
	}

	loadAdminExamResults() {
		this.isLoadingAdminExamResults = true;

		// /results/edit/107/560
		const url = `/results/edit/${this.routeParams.seriesId}/${this.routeParams.classId}`;
		this.examService.doGet(url).subscribe(
			(res) => {
				this.results = res;
				this.results.list.forEach((r: any) => {
					r.edit = false;
					r.raw_temp = r.raw;
					r.grade_temp = r.grade;
				});

				this.isLoadingAdminExamResults = false;

				this.setDefaultSubjectPaper();
				this.sortedData = this.results?.list;
			},
			() => {
				//console.log(err);
				this.isLoadingAdminExamResults = false;
			}
		);
	}

	goBack() {
		this.location.back();
	}

	dropdownHideEvent() {
		$(".table-responsive").trigger("hidden.bs.dropdown");
	}

	initLogic() {
		if (this.routeParams.seriesId > 0 && this.routeParams.lock == 1) {
			if (this.examsToPublishAdmin && this.examsToPublishAdmin?.length > 0) {
				this.examsToPublish = this.examsToPublishAdmin;
			}
		}
		if (
			this.routeParams.lock != null &&
			this.routeParams.lock == 1 &&
			this.routeParams.seriesId != null &&
			this.routeParams.seriesId.length > 0
		) {
			this.lock_exam = true;
		}
		if (this.routeParams.viewonly != null && this.routeParams.viewonly == 1) {
			this.viewonly = true;
		}
	}

	selectAllToggle(select_all: any) {
		this.results.list.forEach((r: any) => {
			r.delete = select_all;
		});
	}

	startDeleteResults() {
		this.initDeleteItems();
		this.showDeleteBox = true;
	}
	stopDeleteResults() {
		this.showDeleteBox = false;
		this.initDeleteItems();
	}

	initDeleteItems() {
		this.select_all = false;
		this.results.list.forEach((r: any) => {
			r.delete = false;
			r.edit = false;
		});
	}
	deleteResults() {
		const result_ids: any = [];
		this.results.list.forEach((r: any) => {
			if (r.delete) {
				result_ids.push(r.resultid);
			}
		});
		if (result_ids.length > 0) {
			Swal.fire({
				title: this.translate.instant("exams.publishSubjectStatus.swal.title"),
				text: this.translate.instant("exams.publishSubjectStatus.swal.text"),
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: this.translate.instant(
					"common.swal.confirmButtonTextProceed"
				),
				cancelButtonText: this.translate.instant(
					"common.swal.cancelButtonTextCancel"
				)
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					let paperid_param = "";
					if (this.results.paperid != undefined && this.results.paperid > 0) {
						paperid_param = "?paperid=" + this.results.paperid;
					}

					const url =
						"/results/delete/score/" +
						this.results.classid +
						"/" +
						this.results.seriesid +
						paperid_param;
					this.examService.doPostWithParams(url, result_ids).subscribe(
						(resp) => {
							console.log(resp.message);

							const message = this.translate.instant(
								"exams.publishSubjectStatus.toastMessages.deleteResultsSuccess"
							);
							this.toastService.success(message);

							this.stopDeleteResults();
							if (this.lock_exam) {
								// //console.log("01")
								// this.loadAdminExamResults();
								this.getExamResults(false);
								// this.getResultstoPublishSubjectTeacher(this.routeParams.classId, this.routeParams.seriesId, this.routeParams.viewonly);
							} else {
								// //console.log("11")
								// this.getResultstoPublish(this.results.classid, this.exam.examid);
								// //console.log("12")
								this.loadAdminExamResults();
								// this.getResultstoPublishSubjectTeacher(this.routeParams.classId, this.routeParams.seriesId, this.routeParams.viewonly);
							}
						},
						(error) => {
							this.responseHandler.error(error, "deleteResults()");
						}
					);
				}
			});
		}
	}
	getResultstoPublish(classid: any, examid: any) {
		this.exam_temp = undefined;
		const url = "/results/unpublished/subjectteacher/" + classid;
		this.examService.doGet(url).subscribe(
			(resp) => {
				this.examsToPublish = resp;
				if (
					this.examsToPublish !== undefined &&
					this.examsToPublish.length > 0
				) {
					this.examsToPublish.forEach((exam: any) => {
						if (exam.examid == examid) {
							this.exam_temp = exam;
						}
					});
					if (this.exam_temp === undefined) {
						this.exam = this.examsToPublish[0];
					} else {
						this.exam = this.exam_temp;
					}
					this.loadAdminExamResults();
					// this.getResultstoPublishSubjectTeacher(this.routeParams.classId, this.routeParams.seriesId, this.routeParams.viewonly);
				}
			},
			(error) => {
				this.responseHandler.error(error, "deleteResults()");
			}
		);
	}
	getExamResults(
		calledAfterNewResultsAdded: any,
		stateparams_seriesid_found?: any,
		paperid?: any
	) {
		console.warn("this.exam >> ", this.exam);
		if (this.exam != null) {
			let paperid_param = "";
			if (paperid != undefined && paperid != null && paperid > 0) {
				paperid_param = "?paperid=" + paperid;
			} else if (
				this.results != undefined &&
				this.results != null &&
				this.results.paperid != undefined &&
				this.results.paperid > 0
			) {
				paperid_param = "?paperid=" + this.results.paperid;
			}

			const url =
				"/results/edit/" +
				this.exam +
				"/" +
				this.routeParams.classId +
				paperid_param;
			this.examService.doGet(url).subscribe(
				(resp) => {
					this.results = resp;
					console.log(this.results);
					this.results.list.forEach((r: any) => {
						r.edit = false;
						r.raw_temp = r.raw;
						r.grade_temp = r.grade;
					});
					this.showLoading = false;
					this.newResults = [];
					if (this.lock_exam && this.results.list.length == 0) {
						this.publish_title = "All Results Deleted";
						this.publish_msg =
							"All the subject results have been successfully deleted";
						this.locked_exam_all_deleted = true;
					}

					if (calledAfterNewResultsAdded) {
						const message = this.translate.instant(
							"exams.publishSubjectStatus.toastMessages.resultsAddSuccess"
						);
						this.toastService.success(message);
					}

					this.setDefaultSubjectPaper();

					if (
						stateparams_seriesid_found == null ||
						stateparams_seriesid_found == undefined ||
						!stateparams_seriesid_found
					) {
						this.router.navigate([this.router.url]);
						// $state.go($state.current, { classid: this.routeParams.classid, seriesid: this.exam.examid }, {
						//   notify: false, reload: false, location: 'replace', inherit: true
						// });
					}
					this.sortedData = this.results?.list;
				},
				() => {
					this.showLoading = false;
				}
			);
		}
	}

	edit_out_of = false;

	init_edit_out_of(status: any) {
		if (status) {
			this.out_of_temp = this.results.max;
		}
		this.edit_out_of = status;
	}
	save_out_of() {
		if (this.out_of_temp == null) {
			const errorMsg = this.translate.instant(
				"exams.publishSubjectStatus.toastMessages.uspecifiedValueWarning"
			);
			this.toastService.warning(errorMsg);
		} else {
			let paperid_param = "";
			if (this.results.paperid != undefined && this.results.paperid > 0) {
				paperid_param = "&paperid=" + this.results.paperid;
			}
			const url =
				"/results/edit/outof/" +
				this.results.classid +
				"/" +
				this.results.seriesid +
				"?max=" +
				this.out_of_temp +
				paperid_param;

			this.examService.doPostNoParams(url).subscribe(
				(resp) => {
					console.log(resp.message);

					const message = this.translate.instant(
						"exams.publishSubjectStatus.toastMessages.saveOutOfSuccess"
					);
					this.toastService.success(message);

					this.edit_out_of = false;
					this.loadAdminExamResults();
					// this.getResultstoPublishSubjectTeacher(this.routeParams.classId, this.routeParams.seriesId, this.routeParams.viewonly);
				},
				(err: any) => {
					// console.log(err.error);
					this.responseHandler.error(err, "save_out_of()");
				}
			);
		}
	}

	addResultRecord() {
		this.newResults.push({ MARKS_TEMP: 0 });
	}

	deleteNewResult(index: any) {
		this.newResults.splice(index, 1);
		if (this.newResults.length === 0) {
			this.initSaveResults();
		}
	}
	isNotValidMarks(obj: any, max: any) {
		if (max == null) {
			max = 100.0;
		}
		const num = parseFloat(obj);
		const isNotANumber = isNaN(num);

		if (isNotANumber) {
			return isNotANumber;
		} else {
			return !(num >= 0.0 && num <= max);
		}
	}
	saveNewResults() {
		this.initSaveResults();
		const listOfAdms: any = [];
		this.newResults.forEach((dt: any, i: number) => {
			if (dt.student !== undefined) {
				const error: any = { msg: [] };
				let identification: any = i + 1;
				if (dt.student.name !== undefined) {
					identification = identification + " (" + dt.student.admno + ")";
				}
				const textCode = "marks";
				const subject_marks = dt[textCode];
				if (subject_marks !== undefined && subject_marks !== null) {
					if (subject_marks.length !== undefined) {
						delete dt[textCode];
					} else if (subject_marks < 0 || subject_marks > this.results.max) {
						const msg =
							"Has invalid marks. Marks should be less than or equal to " +
							this.results.max;
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					}
				}

				if (subject_marks === null) {
					delete dt[textCode];
				}
				if (
					dt.student.admno === undefined ||
					dt.student.admno.trim().length === 0
				) {
					const msg = "Does not have an ADMISSION NUMBER";
					if (error.title === undefined) {
						error.title = "Student " + identification;
					}
					error.msg.push(msg);
				} else {
					this.newResults.forEach((s: any, j: number) => {
						if (j !== i && s.student !== undefined) {
							if (dt.student.admno === s.student.admno) {
								const msg =
									"Admission Number is the same as that of student " + (j + 1);
								if (error.title === undefined) {
									error.title = "Student " + identification;
								}
								error.msg.push(msg);
							}
						}
					});
				}
				if (error.title !== undefined && error.msg.length > 0) {
					this.custom_errors.push(error);
				}
			} else {
				this.error_exam = true;
				this.error_msg = "Please specify the student";
				this.custom_errors.push({
					title: "No Student Selected",
					msg: [this.error_msg]
				});
			}
		});
		if (this.custom_errors.length > 0) {
			this.rightSidebar = true;
		} else if (!this.error_exam) {
			this.newResults.forEach((dt: any) => {
				const dt_temp = JSON.parse(JSON.stringify(dt));
				const grade_key = this.results.subjectTextCode + "_grade";
				const subject_marks = dt_temp["marks"];
				const subject_grade = dt_temp["grade"];
				let addItem = false;
				//////////////console.log(dt);
				//////////////console.log(dt_temp);
				const marks_holder: any = {};
				if (
					subject_marks !== undefined &&
					subject_marks !== null &&
					subject_marks <= this.results.max &&
					!this.isNotValidMarks(subject_marks, this.results.max)
				) {
					marks_holder[this.results.subjectTextCode] = subject_marks;
					addItem = true;
				}
				if (subject_grade !== undefined && subject_grade !== null) {
					marks_holder[grade_key] = subject_grade;
					addItem = true;
				}
				if (addItem) {
					marks_holder.admno = dt_temp.student.admno;
					listOfAdms.push(marks_holder);
				}
			});
			if (listOfAdms.length > 0) {
				this.showLoading = true;
				let paperid_param = "";
				if (this.results.paperid != undefined && this.results.paperid > 0) {
					paperid_param = "?paperid=" + this.results.paperid;
				}

				//do post
				const url =
					`/results/upload/subject/${this.results.classid}/${this.results.seriesid}` +
					paperid_param;
				this.examService.doPostWithParams(url, listOfAdms).subscribe(
					(res) => {
						this.newResults = [];
						// this.getExamResults(true,'','');
						console.log(res.message);

						const message = this.translate.instant(
							"exams.publishSubjectStatus.toastMessages.saveNewResultsSuccess"
						);
						this.toastService.success(message);

						this.loadAdminExamResults();
						this.getResultstoPublishSubjectTeacher(
							this.routeParams.classId,
							this.routeParams.seriesId,
							this.routeParams.viewonly
						);

						this.showLoading = false;
					},
					(err) => {
						if (err?.status == 422) {
							this.custom_errors = err.error;
							this.rightSidebar = true;
							this.showLoading = false;
						}
					}
				);
			} else {
				this.error_exam = true;
				this.error_msg = "No marks specified";
			}
		}

		let stateparams_seriesid_found = false;
		if (this.examsToPublish !== undefined && this.examsToPublish.length > 0) {
			this.exam = undefined;
			if (!this.lock_exam) {
				this.exam = this.examsToPublish[0].examid;
			}

			this.examsToPublish.forEach((exam: any) => {
				if (exam.examid == this.routeParams.seriesId) {
					this.exam = exam.examid;
					stateparams_seriesid_found = true;
				}
			});
			this.getExamResults(false, stateparams_seriesid_found, "");
		}
	}

	saveResult(studentData: any) {
		let params = "";
		if (
			studentData?.grade &&
			(studentData.grade === "X" || studentData.grade === "Y")
		) {
			params = "?grade=" + studentData.grade;
			studentData.raw_temp = studentData.raw;
		}
		if (
			studentData?.raw_temp &&
			studentData?.raw_temp >= 0 &&
			studentData.raw_temp <= this.results.max
		) {
			let paperIdParam = "";
			if (this.results?.paperid && this.results?.paperid > 0) {
				let prefix = "?";
				if (params.length > 0) {
					prefix = "&";
				}
				paperIdParam = prefix + "paperid=" + this.results.paperid;
			}
			params += paperIdParam;
			studentData.isLoading = true;
			this.examService.saveStudentResult(studentData, params).subscribe({
				next: (resp: any) => {
					studentData.edit = false;
					studentData.grade = resp.description;
					studentData.score = parseFloat(resp.message);
					studentData.raw = studentData.raw_temp;
					if (studentData?.grade === "X" || studentData.grade === "Y") {
						studentData.score = 0;
						studentData.raw = 0;
						studentData.raw_temp = 0;
					}

					studentData.updatedBy = this.userInfo.name;
					studentData.updatedOn = this.datePipe.transform(new Date(), "d/M/yyyy");


					const message = this.translate.instant(
						"exams.publishSubjectStatus.toastMessages.marksUpdateSuccess"
					);
					this.toastService.success(message);
					studentData.isLoading = false;
				},
				error: (err: any) => {
					studentData.isLoading = false;
					this.responseHandler.error(err, "saveResult()");
				}
			});
		} else {
			const errorMsg = this.translate.instant(
				"exams.publishSubjectStatus.toastMessages.invalidMarksWarning",
				{ max: this.results.max }
			);
			this.toastService.warning(errorMsg);
		}
	}

	publishResults() {
		this.initItems();
		Swal.fire({
			title: this.translate.instant("exams.publishSubjectStatus.swal.title2"),
			text: this.translate.instant("exams.publishSubjectStatus.swal.text2"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextOkay"
			)
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				let paperid_param = "";
				if (this.results.paperid != undefined && this.results.paperid > 0) {
					paperid_param = "?paperid=" + this.results.paperid;
				}
				const url =
					"/results/publish/subjectteacher/" +
					this.exam +
					"/" +
					this.routeParams.classId +
					paperid_param;

				this.examService.doPutNoParams(url).subscribe(
					(resp) => {
						this.publish_title = this.translate.instant(
							"exams.publishSubjectStatus.swal.title3"
						);
						this.publish_msg = this.translate.instant(
							"exams.publishSubjectStatus.swal.text3"
						);

						Swal.fire({
							title: this.translate.instant(
								"exams.publishSubjectStatus.swal.title3"
							),
							text: this.translate.instant(
								"exams.publishSubjectStatus.swal.text3"
							),
							icon: "success",
							confirmButtonText: this.translate.instant(
								"common.swal.confirmButtonTextClose"
							)
						}).then(() => {
							this.goBack();
						});
					},
					(error) => {
						this.responseHandler.error(error, "publishResults()");
					}
				);
			}
		});
	}

	initItems() {
		this.publish_success_status = false;
		this.publish_title = this.translate.instant(
			"exams.publishSubjectStatus.swal.noResultsFoundTitle"
		);
		this.publish_msg = this.translate.instant(
			"exams.publishSubjectStatus.swal.noResultsFoundMsg"
		);
	}

	initSaveResults() {
		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.rightSidebar = false;
	}

	private setDefaultSubjectPaper() {
		if (
			this.results.paperid != undefined &&
			this.results.subject_papers != undefined &&
			this.results.subject_papers.length > 0
		) {
			this.results.subject_papers.forEach((sp: any) => {
				if (sp.paperid == this.results.paperid) {
					this.results.subject_paper = sp;
				}
			});
		}
	}

	sortedData: Array<any> = [];
	sortData(sort: Sort) {
		const data = this.results?.list?.slice();
		if (!sort.active || sort.direction === "") {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			const isAsc = sort.direction === "asc";
			switch (sort.active) {
			case "admno":
				return compare(a.admno, b.admno, isAsc);
			case "indexno":
				return compare(a.indexno, b.indexno, isAsc);
			case "name":
				return compare(a.name, b.name, isAsc);
			case "raw":
				return compare(a.raw, b.raw, isAsc);
			case "score":
				return compare(a.score, b.score, isAsc);
			default:
				return 0;
			}
		});
	}
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
