import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import Swal from "sweetalert2";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-subject-student-addition",
	templateUrl: "./subject-student-addition.component.html",
	styleUrls: ["./subject-student-addition.component.scss"],
})
export class SubjectStudentAdditionComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	@Input() streamId?: number;
	@Input() classId?: number;
	@Input() streamInfo?: any;
	@Input() schoolTypeData?: any;

	@Output() onStudentAdditionSuccess = new EventEmitter<any>();

	isLoadingStudentList = false;
	nonClassMembers: any[] = [];

	constructor(
		public _location: Location,
		private studentsService: StudentsService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private responseHandlerService: ResponseHandlerService,
	) {}

	ngOnInit(): void {
		this.getStudentList();
	}

	private getStudentList() {
		if (this.streamId && this.classId) {
			this.isLoadingStudentList = true;

			this.studentsService
				.getStudentsList_Stream(<number>this.streamId, this.classId)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res: any) => {
						this.nonClassMembers = res.filter((student) => {
							if (this.streamInfo?.students?.length === 0) return student;

							return !student.isClassMember;
						});
					},
					error: (err) => {
						this.responseHandlerService.error(err, "getStudentList()");
					},
					complete: () => {
						this.isLoadingStudentList = false;
					},
				});
		}
	}

	toggleAllStudents() {
		this.nonClassMembers.forEach((student: any) => {
			student.add ? (student.add = false) : (student.add = true);
		});
	}

	selectStudent(student: any, val: any) {
		student.add = val?.target.checked;
	}

	async addStudentsConfirmation() {
		const studentAdmnos: any[] = [];
		this.nonClassMembers.forEach((student: any) => {
			if (student.add) {
				studentAdmnos.push(student.admno);
			}
		});

		// console.log("studentAdmnos >> ", studentAdmnos);

		if (studentAdmnos.length > 0) {
			const className = `${this.schoolTypeData.formoryear} ${this.streamInfo.form} ${this.streamInfo.stream} ${this.streamInfo.subject}`;

			const result = await Swal.fire({
				title: this.translate.instant(
					"classes.manageSubject.swal.titleAddStudents"
				),
				text: this.translate.instant(
					"classes.manageSubject.swal.textAddStudents",
					{ className: className }
				),
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#43ab49",
				cancelButtonColor: "#ff562f",
				confirmButtonText: this.translate.instant(
					"classes.manageSubject.swal.confirmButtonTextAddStudents"
				),
			});

			if (result.isConfirmed) this.addStudents(studentAdmnos);
		}
	}

	private addStudents(studentAdmnos: string[]) {
		const payload = {
			classId: <number>this.classId,
			admNo: studentAdmnos,
		};

		this.studentsService
			.addStudentToSubject(payload)
			.pipe(
				this.toastService.observe({
					loading: "Adding...",
					success: (res: any) => {
						console.log(res);
						this.onStudentAdditionSuccess.emit();
						this.removeStudentsFromList(studentAdmnos);
						return res?.message || "Student(s) updated successfully!";
					},
					error: (err) => {
						console.log(err);
						return "An error occurred adding the student(s)";
					},
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private removeStudentsFromList(studentAdmnos: string[]) {
		this.nonClassMembers = this.nonClassMembers.filter(nonClassMember => !studentAdmnos.includes(nonClassMember.admno));
	}

	goBack() {
		this._location.back();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
