import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { of, Subject, Subscription } from "rxjs";
import Swal from "sweetalert2";
import { HotToastService } from "@ngneat/hot-toast";
import { catchError } from "rxjs/operators";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-manage-subject",
	templateUrl: "./manage-subject.component.html",
	styleUrls: ["./manage-subject.component.scss"]
})
export class ManageSubjectComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	routeId: any;
	streamId: any;
	subjectSubscription?: Subscription;
	stream_info: any;
	error_st = false;
	error_msg = "";
	schoolTypeData!: SchoolTypeData;

	studentsRemovalOption = true;

	constructor(
    private classesService: ClassesService,
    private dataService: DataService,
    public activatedRoute: ActivatedRoute,
    private toastService: HotToastService,
    private translate: TranslateService,
    private responseHandlerService: ResponseHandlerService,
    public _location: Location) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		// console.warn("Snapshot2 >> ", this.routeId);
		if (this.routeId) {
			this.getClassSubject(this.routeId);
		} else {
			console.warn("No Id found for stream subject");
		}

		this.streamId = this.activatedRoute.snapshot.paramMap.get("streamId");
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();

		this.subjectSubscription?.unsubscribe();
	}

	toggleAllStudents() {
		this.stream_info?.students.forEach((student: any) => {
			student.remove? student.remove = false: student.remove = true;
			// console.warn("student.remove >> ", student.remove);
		});
	}

	getClassSubject(id: any) {
		this.subjectSubscription = this.classesService.getClassSubject(id).subscribe(val => {
			// console.warn("getClassSubject >> ", val);
			this.stream_info = val;
		});
	}

	assignClassMemberTeacher(stud: any, selectedTeacher: any) {
		console.warn(stud, selectedTeacher.id);
		// var url = "api/groups/class/classteacher/" + selected_teacher.id + "?streamid=" + streamid;
		this.classesService.assignClassMemberTeacher(this.routeId, stud.userid, selectedTeacher.id)
			.subscribe({
				next: data => {
					console.warn("DATA >> ", data);
					this.getClassSubject(this.routeId);
				},
				error: error => {
					// this.errorMessage = error.message;
					console.error("There was an error!", error);
					this.responseHandlerService.error(error, "assignClassMemberTeacher()");
				}
			});
	}

	removeClassMemberTeacher(student: any) {
		console.warn("removeClassMemberTeacher >> ", student);
		Swal.fire({
			title: this.translate.instant("classes.manageSubject.swal.titleRemoveClassMemberTeacher"),
			text: this.translate.instant("classes.manageSubject.swal.textRemoveClassMemberTeacher", { teacher: student.teacher, student: student.name }),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			confirmButtonText: this.translate.instant("classes.manageSubject.swal.confirmButtonTextRemoveClassMemberTeacher")
		}).then((result) => {
			if (result.isConfirmed) {
				this.classesService.deleteClassMemberTeacher(this.routeId, student.userid)
					.subscribe({
						next: data => {
							console.warn("DATA >> ", data);
							this.getClassSubject(this.routeId);
							Swal.fire(
								this.translate.instant("classes.manageSubject.swal.titleRemoveClassMemberTeacherSuccess"),
								this.translate.instant("classes.manageSubject.swal.textRemoveClassMemberTeacherSuccess"),
								"success"
							);
						},
						error: error => {
							// this.errorMessage = error.message;
							console.error("There was an error!", error);
							this.responseHandlerService.error(error, "removeClassMemberTeacher()");
						}
					});
			}
		});
	}

	selectStudent(student: any, val: any) {
		student.remove = val?.target.checked;
		// console.warn("student >> ", student);
	}

	removeStudents() {
		const student_ids: any[] = [];
		this.stream_info?.students.forEach((student: any) => {
			if (student.remove) {
				student_ids.push(student.userid);
			}
		});
		console.warn("removeStudents student_ids.length>> ", student_ids.length);
		if (student_ids.length > 0) {
			const class_name = `${this.schoolTypeData.formoryear} ${this.stream_info.form} ${this.stream_info.stream} ${this.stream_info.subject}`;
			Swal.fire({
				title: this.translate.instant("classes.manageSubject.swal.titleRemoveStudents"),
				text: this.translate.instant("classes.manageSubject.swal.textRemoveStudents", { className: class_name }),
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant("classes.manageSubject.swal.confirmButtonTextRemoveStudents")
			}).then((result) => {
				if (result.isConfirmed) {
					const url = `groups/class/subject/members/${this.routeId}`;
					this.dataService.send(JSON.stringify(student_ids), url)
						.pipe(
							this.toastService.observe(
								{
									loading: "Removing...",
									success: (s) => "Students updated successfully!",
									error: (e) => "An error occurred removing student!",
								}
							),
							catchError((error) => of(error))
						)
						.subscribe({
							next: data => {
								console.warn("DATA >> ", data);
								this.stream_info = data;
							},
							error: error => {
								// this.errorMessage = error.message;
								console.error("send() error!", error);
								this.error_st = true;
								this.error_msg = error.message;
							}
						});
				}
			});
		}
	}

	toggleOption(option: "remove"| "add") {
		switch (option) {
		case "remove":
			this.studentsRemovalOption = true;
			break;
		case "add":
			this.studentsRemovalOption = false;
			break;
		default:
			this.studentsRemovalOption = true;
			break;
		}
	}

	onStudentAdditionSuccess() {
		this.getClassSubject(this.routeId);
	}

	goBack() {
		this._location.back();
	}
}
