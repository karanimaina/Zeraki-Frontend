import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Observable, Subscription } from "rxjs";
import { APIStatus } from "src/app/@core/enums/api-status";
import NotesCategoryState from "src/app/@core/services/student/notes/notes-category.state";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-student-messages",
	templateUrl: "./student-messages.component.html",
	styleUrls: ["./student-messages.component.scss"]
})
export class StudentMessagesComponent implements OnInit, OnDestroy {
	routeId: any;
	student: any;
	page = 0;
	action = 1;
	sendTextMessage = false;
	sendEmail = false;
	message: any = {};
	current_message: any;
	image_path: any;
	error_status = false;
	error_msg = "";
	send_message_success_status = false;
	showLoading = false;
	send_message_success_msg = "";
	isBackup = false;
	user_roles: any;
	schoolTypeData?: SchoolTypeData;
	schoolInfo?: SchoolInfo;
	schoolInfoSub?: Subscription;

	readonly APIStatus = APIStatus;

	notesCategoriesStatus$: Observable<APIStatus> = this.notesCategoryState.notesCategoriesStatus$;
	notesCategories$: Observable<string[] | null> = this.notesCategoryState.notesCategories$;

	constructor(
		private activatedRoute: ActivatedRoute,
		private studentsService: StudentsService,
		private schoolService: SchoolService,
		private notesCategoryState: NotesCategoryState,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private rolesService: RolesService,
	) { }

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		// console.warn("Snapshot2 >> ", this.routeId);
		this.isBackup = this.dataService.getIsBackup();
		this.getUserRoles();
		this.getStudentMessages(this.routeId);

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	getSchoolInfo() {
		this.schoolInfoSub = this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	getUserRoles() {
		this.rolesService.roleSubject.subscribe(resp => {
			// console.warn("getUserRoles() >> ", resp);
			this.user_roles = resp;
		});
	}

	getStudentMessages(studentId: any) {
		this.studentsService.getStudentMessages(studentId, 0).subscribe(resp => {
			// console.warn("getStudentMessages >> ", resp);
			const messages: any = resp;
			if (messages !== undefined && messages.page !== undefined) {
				this.student = messages;
				this.page = this.student.page;
				this.sendTextMessage = false;
				this.sendEmail = false;
				if (this.student.hasPhone) {
					this.sendTextMessage = true;
				}
				if (this.student.hasEmail) {
					this.sendEmail = true;
				}
				this.setStudentPhoto();
			}
		});
	}

	toggleAction(action: number) {
		this.action = action;
		this.initItems();
	}

	firstPage() {
		this.action = 1;
		this.initItems();
		this.page = 0;
		this.getMessages(this.page);
	}

	previousPage() {
		this.page = this.page - 1;
		this.getMessages(this.page);
	}

	nextPage() {
		this.page = this.page + 1;
		this.getMessages(this.page);
	}

	setCurrentMessage(message: any) {
		this.action = 3;
		this.current_message = message;
	}

	getMessages(page: number) {
		let url = "groups/student/messages/" + this.routeId + "/" + page;
		if (page > 0) {
			url += "?total=" + this.student.total;
		}
		this.dataService.get(url).subscribe({
			next: resp => {
				console.warn(" getMessages DATA >> ", resp);
				this.student = resp;
				this.page = this.student.page;
				this.sendTextMessage = false;
				this.sendEmail = false;
				if (this.student.hasPhone) {
					this.sendTextMessage = true;
				}
				if (this.student.hasEmail) {
					this.sendEmail = true;
				}
			},
			error: error => {
				console.error("Error >> ", error);
			},
			complete: () => {
				this.setStudentPhoto();
			}
		});
	}

	setStudentPhoto() {
		this.image_path = this.dataService.getUserImage();
		if (this.student.url !== null && this.student.url.length > 0) {
			this.image_path = this.dataService.getUserImage(this.student.url);
		}
	}

	sendMessage() {
		this.error_status = false;
		this.error_msg = "";

		Swal.fire({
			title: this.translate.instant("students.messages.swal.title"),
			text: this.translate.instant("students.messages.swal.text", { studentName: this.student.name }),
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((result) => {
			if (result.isConfirmed) {
				this.showLoading = true;
				const param = "?phone=" + this.sendTextMessage + "&email=" + this.sendEmail;
				// console.warn("student_data", student_data);
				this.dataService.send(this.message, `groups/student/message/${this.routeId}${param}`)
					.subscribe({
						next: data => {
							const responseData: any = data;
							console.warn("DATA >> ", responseData);
							this.send_message_success_status = true;
							this.showLoading = false;
							const message = this.translate.instant("students.messages.toastMessages.messageSentSuccess");
							this.toastService.success(message);
						},
						error: error => {
							// this.errorMessage = error.message;
							console.error(error);
							this.showLoading = false;
							if (error.message !== undefined) {
								this.error_status = true;
								this.error_msg = error.message;
							}
							const message = this.translate.instant("common.toastMessages.anErrorOccurred2");
							this.toastService.error(message);
						},
						complete: () => {
							this.firstPage();
						}
					});
			}
		});
	}

	initItems() {
		this.message = {};
		// $scope.message.text = ["<p>Sample Message</p>"].join("");
		this.send_message_success_status = false;
		this.send_message_success_msg = "";
		this.showLoading = false;
	}

	ngOnDestroy(): void {
		this.schoolInfoSub?.unsubscribe();
	}

}
