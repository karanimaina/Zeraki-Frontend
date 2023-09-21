import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import Swal from "sweetalert2";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExcelTemplateHeader } from "src/app/@core/models/excel/excel-template-header";
import { SubjectPaperService } from "../../manage-exam/config-exam/services/subject-paper.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";


@Component({
	selector: "app-upload-exams-subject",
	templateUrl: "./upload-exams-subject.component.html",
	styleUrls: ["./upload-exams-subject.component.scss"],
})
export class UploadExamsSubjectComponent implements OnInit, OnDestroy {
	private _destroy$: Subject<boolean> = new Subject();
	routeParams: any = {};
	exams_Admin: any;
	subjectPresets: any;
	class_info: any;
	exams: any[] = [];
	examSeries: any[] = [];
	stream_members: any;
	roles: any;

	all_index_numbers_available = false;
	uploadBy = 1;
	sortBy = "ADMNO_ORDER";
	uploadByAdmno = 1;
	uploadByIndexno = 2;
	streamMembers: any[] = [];

	showSheet = false;
	newStudents: any[] = [];
	subject_teachers: any[] = [];
	subject_class_students: any[] = [];
	lock_exam = false;
	exam: any = {
		series: {
			exam_form: "",
			term_menu_name: "",
			classid: "",
			exam_menu_name: "",
			year: "",
			max: "",
			name: "",
			term: "",
			seriesid: ""
		}
	};
	max: any;
	data: any[] = [];
	data_file: any[] = [];
	data_final: any[] = [];
	non_class_members: any[] = [];
	non_class_members_all: any[] = [];
	data_visibility_stats: any = {};
	// uploadType = 2;
	keyInMarks = true;
	upload_from_sheet = false;
	custom_errors: any[] = [];
	upload_results_success_status = false;
	error_exam = false;
	error_msg = "";
	rightSidebar = false;
	schoolTypeData?: SchoolTypeData;
	showLoading = false;

	isLoadingSchoolTypeData = false;
	isLoadingClass = false;
	isLoadingStreamMembers = false;
	isLoadingSubjectPresets = false;
	isLoadingExamsAdmin = false;

	get isLoading(): boolean {
		return (
			this.isLoadingSchoolTypeData
			|| this.isLoadingClass
			|| this.isLoadingStreamMembers
			|| this.isLoadingSubjectPresets
			|| this.isLoadingExamsAdmin
		);
	}

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private toastService: HotToastService,
		private route: ActivatedRoute,
		public _location: Location,
		private translate: TranslateService,
		private rolesService: RolesService,
		private subjectPaperService: SubjectPaperService,
		private responseHandler: ResponseHandlerService
	) { }

	ngOnDestroy(): void {
		this._destroy$.next(true);
		this._destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.route.params.subscribe((param: any) => {
			this.routeParams = param;
			this.getSchoolTypeData();
			this.controller();
			this.getUserRoles();
		});
	}

	userRoles: any = {};
	getUserRoles() {
		this.rolesService.roleSubject.subscribe((role: any) => {
			this.userRoles = role;
		});
	}

	getSchoolTypeData() {
		this.isLoadingSchoolTypeData = true;

		this.dataService.schoolData.subscribe(val => {
			// //console.warn("getSchoolTypeData >> ", val);
			this.schoolTypeData = val;
			this.isLoadingSchoolTypeData = false;
			this.getClass();
		});
	}
	getClass() {
		this.isLoadingClass = true;

		this.examService.getClass(this.routeParams.classId).subscribe(resp => {
			// //console.warn("getClass >> ", resp);
			this.class_info = resp;
			this.class_info.selected_teacher_id = 0;
			this.isLoadingClass = false;
			this.getStream_members(this.class_info.streamid, this.class_info.classid);
		});
	}

	getStream_members(streamid: any, classid: any) {
		this.isLoadingStreamMembers = true;

		this.examService.getStudentsList_Stream(streamid, classid).subscribe((resp) => {
			// //console.warn(resp);
			this.stream_members = resp;
			this.streamMembers = this.stream_members;
			//console.log(resp)
			this.isLoadingStreamMembers = false;
			this.getSubjectPresets(this.class_info);
			this.getExamsAdmin();
		}, (err) => {
			//console.log(err)
			this.isLoadingStreamMembers = false;
		});
	}
	getSubjectPresets(cInfo: any) {
		this.isLoadingSubjectPresets = true;

		this.subjectPaperService.getSinglePaperPreset(cInfo.subjectid)
			.pipe(
				takeUntil(this._destroy$), 
				finalize(() => {
					this.isLoadingSubjectPresets = false;
				}))
			.subscribe({
				next: (resp: any) => {
					this.subjectPresets = resp.presets;
				
				},
				error: (error: any) => {
					this.responseHandler.error(error, "getSubjectPresets()");
				}
			});

	}
	getExamsAdmin() {
		this.isLoadingExamsAdmin = true;

		let exam_found = false;
		this.examService.getExamsToUpload_SubjectClass(this.routeParams.classId).subscribe(

			resp => {
				//('1')
				// console.warn("getExamsAdmin >> ", resp);
				this.exams = resp;
				this.examSeries = this.exams;
				if (this.routeParams.seriesId > 0 && this.routeParams.lock == 1 && this.exams != undefined && this.exams != null && this.exams.length > 0) {
					this.exams.forEach(exam => {
						if (exam.seriesid == this.routeParams.seriesId) {
							exam_found = true;
							this.exam = exam;
						}
					});
				}
			},
			error => {
				console.error("getExamsAdmin >> ", error);
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			},
			() => {
				//()
				if (this.routeParams.seriesId > 0 && this.routeParams.lock == 1 && !exam_found) {
					this.examService.getExamsToUpload_SubjectClass(this.routeParams.classId, this.routeParams.seriesId).subscribe(
						(response: any) => {
							//console.warn("response >> ", response);
							response;
						},
						(err: any) => {
							//console.error("ERR >> ", err);
							const message = this.translate.instant("common.toastMessages.anErrorOccurred");
							this.toastService.error(message);
						},
						() => {
							this.controller();
						}
					);
				} else {
					this.controller();
					undefined;
				}

				this.isLoadingExamsAdmin = false;
			}
		);
	}







	controller() {
		//console.log(this.streamMembers)
		if (this.streamMembers != undefined && this.streamMembers != null && this.streamMembers.length > 0) {
			let valid_index_numbers = 0;
			this.streamMembers.forEach(sm => {
				if (sm.indexno != undefined && sm.indexno != null) {
					valid_index_numbers++;
				}
			});
			this.all_index_numbers_available = (this.streamMembers.length == valid_index_numbers);
		}

		if (this.routeParams.seriesId > 0 && this.routeParams.lock == 1) {
			if (this.exams_Admin != undefined && this.exams_Admin != null && this.exams_Admin.length > 0) {
				this.examSeries = this.exams_Admin;
			}
		}

		if (this.routeParams.lock != null && this.routeParams.lock == 1 && this.routeParams.seriesId != null && this.routeParams.seriesId > 0) {
			this.lock_exam = true;

		}

		if (this.examSeries != null && this.examSeries.length > 0) {
			let stateparams_seriesid_found = false;
			let selected_exam = null;
			if (!this.lock_exam) {
				selected_exam = this.examSeries[0];
			}
			if (this.routeParams.seriesId != null && this.routeParams.seriesId > 0) {
				this.examSeries.forEach(exam => {
					if (exam.seriesid == this.routeParams.seriesId) {
						selected_exam = exam;
						stateparams_seriesid_found = true;
					}
				});
			}
			if (selected_exam != null) {
				this.exam = {};
				this.exam.series = selected_exam;
				if (!stateparams_seriesid_found) {
					this.onExamChange();
				}
			}
		}

		this.onUploadTypeChange("key");
		this.initBoolean();
	}

	processNewStudents() {
		this.newStudents.forEach((dt, i) => {
			if (dt.student !== undefined && dt.student !== null) {
				const error: any = { msg: [] };
				let identification: any = (i + 1);
				if (dt.student.name !== undefined) {
					identification = identification + " (" + dt.student.admno + ")";
				}

				const textCode = "marks";
				const subject_marks = dt[textCode];
				if (subject_marks !== undefined && subject_marks !== null) {
					if (subject_marks.length !== undefined) {
						delete dt[textCode];
					} else if (subject_marks < 0 || subject_marks > this.max) {
						const msg = "Has invalid marks. Marks should be greater than 0 and less than or equal to " + this.max;
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					}
				}
				if (subject_marks === null) {
					delete dt[textCode];
				}

				if (dt.student.admno === undefined || dt.student.admno.trim().length === 0) {
					const msg = "Does not have an ADMISSION NUMBER";
					if (error.title === undefined) {
						error.title = "Student " + identification;
					}
					error.msg.push(msg);
				} else {
					this.newStudents.forEach((s: any, j) => {
						if (j !== i && s.student !== undefined) {
							if (dt.student.admno === s.student.admno) {
								const msg = "Admission Number is the same as that of student " + (j + 1);
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
			}
		});
	}

	@ViewChild("seriesmax") seriesmax?: any;
	processFile(form: NgForm) {
		// console.log(form)
		if (form.invalid) {
			// console.log(this.seriesmax.errors.required == true);
			if (this.seriesmax?.errors?.required == true) {
				this.toastService.error("Maximum Marks cannot be empty");
				return;
			}
		}



		this.initBoolean();

		if (this.schoolTypeData?.possible_forms_list.indexOf(this.class_info?.form.toString()) == -1) {
			this.error_exam = true;
			this.error_msg = "Invalid Exam. You can only upload results for " + this.schoolTypeData?.formoryear + " " + this.schoolTypeData?.possible_forms_list[0] + " to " + this.schoolTypeData?.possible_forms_list[this.schoolTypeData?.possible_forms_list?.length - 1];
		} else {
			let listOfAdms: any[] = [];
			if (!(this.data.length > 0)) {
				this.data = [];
			}
			if (!(this.data_file.length > 0)) {
				this.data_file = [];
			}

			if (this.keyInMarks) {
				const data_final: any[] = [];
				this.data.forEach(dt => {
					if (dt.visible) {
						data_final.push(dt);
					}
				});
				const one: any[] = [];
				this.data_final = one.concat(data_final);
			} else {
				const two: any[] = [];
				this.data_final = two.concat(this.data_file);
			}
			// console.table(this.data_final)
			this.data_final.forEach((dt, i) => {
				const error: any = { msg: [] };
				let identification: any = (i + 1);
				if (dt.NAME !== undefined) {
					identification = identification + " (" + dt.NAME + ")";
				}

				const textCode = "MARKS";
				const subject_marks = dt[textCode];
				// console.log(dt);
				if (subject_marks !== undefined && subject_marks !== null) {
					if (subject_marks.length !== undefined && !(subject_marks.length > 0)) {
						delete dt[textCode];
					} else if (subject_marks < 0 || subject_marks > this.max) {
						const msg = "Has invalid marks. Marks should be greater than 0 and less than or equal to " + this.max;
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					}
				}
				if (subject_marks === null) {
					delete dt[textCode];
				}

				if (this.uploadBy == this.uploadByIndexno) {
					if (dt.INDEXNO === undefined || dt.INDEXNO.trim().length === 0) {
						const msg = "Does not have an INDEX NUMBER";
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					} else {
						this.data_final.forEach((s, j) => {
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
				} else {
					if (dt.ADMNO === undefined || dt.ADMNO.trim().length === 0) {
						const msg = "Does not have an ADMISSION NUMBER";
						if (error.title === undefined) {
							error.title = "Student " + identification;
						}
						error.msg.push(msg);
					} else {
						this.data_final.forEach((s, j) => {
							if (j !== i) {
								if (dt.ADMNO === s.ADMNO) {
									const msg = "Admission Number is the same as that of student " + (j + 1);
									if (error.title === undefined) {
										error.title = "Student " + identification;
									}
									error.msg.push(msg);
								}
							}
						});
					}
				}

				if (error.title !== undefined && error.msg.length > 0) {
					this.custom_errors.push(error);
				}
			});
			this.processNewStudents();
			if (this.custom_errors.length > 0) {
				this.rightSidebar = true;
			} else {
				Swal.fire({
					title: this.translate.instant("exams.uploadedExamsSubject.swal.title2"),
					text: this.translate.instant("exams.uploadedExamsSubject.swal.text2"),
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#43ab49",
					cancelButtonColor: "#ff562f",
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
					cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
				}).then((result) => {
					if (result.isConfirmed) {
						this.data_final.forEach(dt => {
							const dt_temp = JSON.parse(JSON.stringify(dt));
							delete dt_temp.NAME;
							const grade_key = this.class_info.subjectTextCode + "_grade";
							const subject_marks = dt_temp["MARKS"];
							const subject_grade = dt_temp["grade"];
							let addItem = false;
							const marks_holder: any = {};
							if (subject_marks !== undefined && subject_marks !== null && subject_marks <= this.max && !this.isNotValidMarks(subject_marks, this.max)) {
								marks_holder[this.class_info.subjectTextCode] = subject_marks;
								addItem = true;
							}
							if (subject_grade !== undefined && subject_grade !== null) {
								marks_holder[grade_key] = subject_grade.trim();
								addItem = true;
							}
							if (addItem) {
								if (this.uploadBy == this.uploadByIndexno) {
									if (dt_temp["INDEXNO"] != undefined && dt_temp["INDEXNO"] != null) {
										marks_holder.indexno = dt_temp["INDEXNO"].trim();
									}
								}
								if (dt_temp["ADMNO"] != undefined && dt_temp["ADMNO"] != null) {
									marks_holder.admno = dt_temp["ADMNO"].trim();
								}

								listOfAdms.push(marks_holder);
							}
						});
						this.newStudents.forEach(dt => {
							const dt_temp = JSON.parse(JSON.stringify(dt));
							const grade_key = this.class_info.subjectTextCode + "_grade";
							const subject_marks = dt_temp["marks"];
							const subject_grade = dt_temp["grade"];
							let addItem = false;
							const marks_holder: any = {};
							if (dt_temp.student !== undefined && dt_temp.student.admno !== undefined && dt_temp.student.admno > 0) {
								if (subject_marks !== undefined && subject_marks !== null && subject_marks <= this.max && !this.isNotValidMarks(subject_marks, this.max)) {
									marks_holder[this.class_info.subjectTextCode] = subject_marks;
									addItem = true;
								}
								if (subject_grade !== undefined && subject_grade !== null) {
									marks_holder[grade_key] = subject_grade.trim();
									addItem = true;
								}
							}
							if (addItem) {
								marks_holder.admno = dt_temp.student.admno.trim();
								listOfAdms.push(marks_holder);
							}
						});
						if (listOfAdms.length > 0) {
							this.showLoading = true;
							let params = "";
							if (this.exam?.subject_paper && this.exam?.subject_paper?.paperid) {
								params = "&paperid=" + this.exam.subject_paper.paperid;
							}

							if (this.uploadBy == this.uploadByIndexno) {
								params += "&upload_by_indexno=true";
							}

							this.dataService.send(listOfAdms, "results/upload/subject/" + this.class_info.classid + "/" + this.exam.series.seriesid + "?max=" + this.max + params).subscribe(
								(resp: any) => {
									//console.warn("send >> ", resp);
									this.showLoading = false;
									if (resp.responseCode == 200) {
										this.upload_results_success_status = true;
										this.exam = {};
										listOfAdms = [];
										this.data = [];
										this.data_file = [];
										this.data_final = [];
									}
								},
								error => {
									this.showLoading = false;
									if (error.status == 422) {

										this.custom_errors = error.error;
										this.rightSidebar = true;
									}
								}
							);
						} else {
							this.error_exam = true;
							this.error_msg = "No marks specified";
							this.toastService.error(this.error_msg);
						}
					}
				});

			}
		}
	}

	get excelTemplateHeaders(): ExcelTemplateHeader[] {
		return [
			// the 'key' refers to translation keys in as in en.json
			{
				key: this.uploadBy == this.uploadByIndexno ? "indexNo" : "admno",
				value: this.uploadBy == this.uploadByIndexno ? "INDEXNO" : "ADMNO",
				translate: true
			},
			{
				key: "name",
				value: "NAME",
				width: 15,
				translate: true
			},
			{
				key: "marks",
				value: "MARKS",
				type: "marks",
				translate: true
			},
		];
	}

	get defaultExcelEntries() {
		return this.streamMembers
			.filter(student => student.isClassMember)
			.map(student => ({
				indexOrAdm: this.uploadBy == this.uploadByIndexno ? student.indexno : student.admno,
				name: student.name
			}));
	}

	readUploadedStudentMarks(uploadedStudentMarks) {
		uploadedStudentMarks
			.filter(studentMark => studentMark.MARKS == "Y" || studentMark.MARKS == "X")
			.forEach(studentMark => {
				studentMark["grade"] = studentMark.MARKS;
				delete studentMark["MARKS"];
			});

		this.data_file = uploadedStudentMarks;
	}


	initBoolean() {
		this.upload_results_success_status = false;
		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.rightSidebar = false;
	}

	addNewStudent() {
		this.newStudents.push({ MARKS_TEMP: 0 });
	}

	deleteNewStudent(index: any) {
		this.newStudents.splice(index, 1);
	}

	onUploadByChange() {
		if (this.uploadBy == this.uploadByIndexno) {
			this.sortBy = "INDEXNO_ORDER";
		} else {
			this.sortBy = "ADMNO_ORDER";
		}
	}

	onExamChange() {
		if (this.exam != null && this.exam.series != null && this.exam.series.exam_form != null) {
			this.exam.subject_paper = null;
			if (this.data && this.data.length > 0) {
				this.initSubjectTeachersStudents();
			}
		}
	}

	onSubjectPaperChange() {
		if (this.exam.subject_paper) {
			const p = this.exam.subject_paper;
			if (p.papername.includes("3") ||
				p.papername.includes("Three") ||
				p.papername.includes("iii")) {
				this.max = this.subjectPresets.paper3Max;

			} else if (p.papername.includes("2") ||
				p.papername.includes("Two") ||
				p.papername.includes("ii")) {
				this.max = this.subjectPresets.paper2Max;

			} else if (p.papername.includes("1") ||
				p.papername.includes("One") ||
				p.papername.includes("i")) {
				this.max = this.subjectPresets.paper1Max;

			}
		} else {
			//  //console.log("undefined")
			this.max = null;
		}
		if (this.data != undefined && this.data != null && this.data.length > 0) {
			this.initSubjectTeachersStudents();
		}
	}

	initData() {
		const teacher_ids: any = [];
		this.subject_teachers = [];
		this.subject_class_students = [];
		const add_overall_teacher = true;
		if (add_overall_teacher) {
			const t: any = {};
			t.teacherid = 0;
			t.teachername = "";
			t.displayname = "All Students";
			this.subject_teachers.push(t);
			teacher_ids.push(0);
		}

		if (this.streamMembers !== undefined && this.streamMembers !== null && this.streamMembers.length > 0) {
			this.streamMembers.forEach(student => {
				if (student.isClassMember) {
					this.data.push({
						ADMNO: student.admno,
						ADMNO_ORDER: student.admno_order,
						INDEXNO: student.indexno,
						INDEXNO_ORDER: student.indexno_order,
						NAME: student.name,
						teacherid: student.teacherid
					});
					this.subject_class_students.push(student);
					if (student.teacherid != undefined && student.teacherid > 0) {
						if (teacher_ids.indexOf(student.teacherid) == -1) {
							const t: any = {};
							t.teacherid = student.teacherid;
							t.teachername = student.teachername;
							t.displayname = student.teachername + "'s Students";
							this.subject_teachers.push(t);
							teacher_ids.push(student.teacherid);

						}
					}
				} else {
					this.non_class_members_all.push(student);
				}
			});
			this.showSheet = true;
		}

		this.initSubjectTeachersStudents();
	}

	onSelectedTeacherChange() {
		this.initSubjectTeachersStudents(this.class_info.selected_teacher_id);
	}

	initVisibilityStats() {
		this.data_visibility_stats = {};
		this.data_visibility_stats.classmembers = 0;
		this.data_visibility_stats.non_classmembers = 0;
		this.data_visibility_stats.teacherstudents = 0;
	}

	initSubjectTeachersStudents(teacherid?: any) {
		this.initBoolean();
		let admnos_with_marks: any = [];
		if (this.exam != undefined && this.exam.series != undefined && this.exam.series.results != undefined) {
			this.exam.series.results.forEach((result: any) => {
				admnos_with_marks.push(result.admno);
			});
			if (this.exam.series.max != undefined) {
				this.max = this.exam.series.max;
			}
		}
		if (this.exam != undefined && this.exam.subject_paper != undefined && this.exam.subject_paper.results != undefined) {
			admnos_with_marks = [];
			this.exam.subject_paper.results.forEach((result: any) => {
				admnos_with_marks.push(result.admno);
			});
			if (this.exam.subject_paper.max != undefined) {
				this.max = this.exam.subject_paper.max;
			}
		}

		/*$scope.disable_max = false;
		if (admnos_with_marks.length > 0) {
		$scope.disable_max = true;
		}*/

		this.non_class_members = [];
		this.non_class_members_all.forEach(student => {
			if (admnos_with_marks.indexOf(student.admno) == -1) {
				this.non_class_members.push(student);
			}
		});
		this.newStudents = [];
		this.initVisibilityStats();
		if (this.subject_teachers.length >= 3 && this.subject_class_students.length > 0) {

			this.data.forEach(data => {
				let visible_status = true;
				if (admnos_with_marks.indexOf(data.ADMNO) == -1) {
					visible_status = true;
					this.data_visibility_stats.classmembers++;
				} else {
					visible_status = false;
				}

				let add = false;
				if (this.class_info != undefined && this.class_info != null && this.class_info.selected_teacher_id != undefined) {
					teacherid = this.class_info.selected_teacher_id;
				}

				if (teacherid == undefined || teacherid == null || teacherid == 0) {
					add = true;
				} else if (teacherid > 0 && teacherid == data.teacherid) {
					add = true;
				}

				if (add && visible_status) {
					this.data_visibility_stats.teacherstudents++;
					data.visible = true;
				} else {
					data.visible = false;
				}
			});
		} else {
			this.data.forEach(data => {
				if (admnos_with_marks.indexOf(data.ADMNO) == -1) {
					data.visible = true;
					this.data_visibility_stats.classmembers++;
					this.data_visibility_stats.teacherstudents++;
				} else {
					data.visible = false;
				}
			});
		}

		//////////////console.log("data_visibility_stats.classmembers: ", $scope.data_visibility_stats.classmembers);
		//////////////console.log("$scope.non_class_members: ", $scope.non_class_members.length);
	}

	onUploadTypeChange(option: string) {
		// //console.warn("onUploadTypeChange", option);
		this.max = undefined;
		switch (option) {
		case "key":
			this.keyInMarks = true;
			this.upload_from_sheet = false;
			if (!(this.data.length > 0)) {
				this.initData();
			} else {
				this.initSubjectTeachersStudents();
			}
			break;
		case "upload":
			this.keyInMarks = false;
			this.upload_from_sheet = true;
			this.newStudents = [];
			break;
		default:
			this.keyInMarks = true;
			this.upload_from_sheet = false;
			break;
		}
		// //console.warn("this.keyInMarks >> ", this.keyInMarks);
		// //console.warn("this.upload_from_sheet >> ", this.upload_from_sheet);
	}

	isNotValidMarks(obj: any, max: any): boolean {
		let result = false;
		if (max == null) {
			max = 100.0;
		}
		const num = parseFloat(obj);
		const isNotANumber = isNaN(num);

		if (isNotANumber) {
			result = isNotANumber;
		} else {
			result = !(num >= 0.0 && num <= max);
		}
		return result;
	}

	goBack() {
		this._location.back();
		// (this.userRoles?.isSchoolAdmin) ? this.router.navigateByUrl("/main/exams/manage") : this._location.back();
	}

	invokeTabKey(event: any) {
		console.warn("Enter pressed");
		console.log("You entered: ", event.which);

		// if (event.which === 13) {
		// 	event.preventDefault();
		// 	//var fields = $(this).parents('form:eq(0),body').find('input, button[type=submit]');
		// 	const fields = $(this).parents("form:eq(0),body").find("input");
		// 	const index = fields.index(this);
		// 	if (index > -1 && (index + 1) < fields.length) {
		// 		fields.eq(index + 1).focus();
		// 	}
		// }
		const currInput = document.activeElement;
		if (currInput?.tagName.toLowerCase() == "input") {
			const inputs = document.getElementsByTagName("input");
			// var currInput = document.activeElement;
			for (let i = 0; i < inputs.length; i++) {
				if (inputs[i] == currInput) {
					const next = inputs[i + 1];
					if (next && next.focus) {
						next.focus();
					}
					break;
				}
			}
		}
	}





}

