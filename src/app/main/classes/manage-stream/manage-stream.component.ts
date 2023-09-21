import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import Swal from "sweetalert2";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { HotToastService } from "@ngneat/hot-toast";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { UserService } from "../../../@core/shared/services/user/user.service";
import { UserInfo } from "../../../@core/models/user-info";
import { takeUntil } from "rxjs/operators";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-manage-stream",
	templateUrl: "./manage-stream.component.html",
	styleUrls: ["./manage-stream.component.scss"]
})
export class ManageStreamComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	streamId: any;
	streamInfoObj: any;
	schoolTypeData!: SchoolTypeData;
	role?: Role;
	private userInfo!: UserInfo;
	classDetails: any;
	showClassListUI = false;

	constructor(
		private classesService: ClassesService,
		private dataService: DataService,
		private roleService: RolesService,
		public _location: Location,
		private translate: TranslateService,
		private toastService: HotToastService,
		private activatedRoute: ActivatedRoute,
		private responseHandler: ResponseHandlerService,
		private userService: UserService) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.streamId = this.activatedRoute.snapshot.paramMap.get("id");
		if (this.streamId) {
			this.getStreamInfo();
		} else {
			console.error("No id found for stream");
		}
		this.getRoles();
		this.getUserInfo();
	}

	getRoles() {
		this.roleService.roleSubject.subscribe(resp => {
			this.role = resp;
		});
	}

	getUserInfo() {
		this.userService.userInfoSubject.subscribe(userInfo => {
			this.userInfo = userInfo;
		});
	}

	getStreamInfo() {
		this.classesService.getStreamInfo(this.streamId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: val => {
					this.streamInfoObj = val;
				},
				error: err => {
					this.responseHandler.error(err, "getStreamInfo()");
				}
			});
	}

	get canManageStream() {
		return this.role?.isSchoolAdmin || this.isClassTeacher;
	}

	get isClassTeacher() {
		return this.userInfo?.email == this.streamInfoObj?.ct?.email;
	}

	assignSubjectTeacher(streamId: number, selectedTeacher: any, subTeacherNo: number) {
		console.warn(streamId, selectedTeacher, subTeacherNo);
		this.classesService.assignSubjectTeacher(streamId, selectedTeacher, subTeacherNo)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: data => {
					const message = this.translate.instant("classes.manageStream.table.subjectTeacherAssigned");
					this.toastService.success(message);
					this.streamInfoObj.stream_info = data;
				},
				error: error => {
					this.responseHandler.error(error, "assignSubjectTeacher()");
				}
			});
	}

	removeSubjectTeacher(aid: number) {
		this.classesService.deleteSubjectTeacher(aid)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: data => {
					const message = this.translate.instant("classes.manageStream.table.subjectTeacherRevoked");
					this.toastService.success(message);
					this.streamInfoObj.stream_info = data;
				},
				error: error => {
					this.responseHandler.error(error, "removeSubjectTeacher()");
				}
			});
	}

	deleteSubjectClass(stream: any) {
		console.warn("Form >>", stream.form);
		console.warn("Stream >>", stream.stream);
		console.warn("Subject >>", stream.subject.name);
		Swal.fire({
			title: this.translate.instant("classes.manageStream.table.swal.titleDeleteSubjectClass"),
			text: this.translate.instant("classes.manageStream.table.swal.textDeleteSubjectClass", { formOrYear: this.schoolTypeData.formoryear, form: stream.form, stream: stream.stream, subjectName: stream.subject.name }),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			confirmButtonText: this.translate.instant("classes.manageStream.table.swal.confirmButtonText")
		}).then((result) => {
			if (result.isConfirmed) {
				this.classesService.deleteSubjectClass(stream.cid)
					.subscribe({
						next: data => {
							console.warn("DATA >> ", data);
							this.streamInfoObj.stream_info = data;
							Swal.fire(
								this.translate.instant("classes.manageStream.table.swal.titleDeleteSubjectClassSuccess"),
								this.translate.instant("classes.manageStream.table.swal.textDeleteSubjectClassSuccess", { subjectName: stream.subject.name }),
								"success"
							);
						},
						error: error => {
							console.error("Delete error!", error);
							Swal.fire(
								this.translate.instant("classes.manageStream.swal.titleDeleteSubjectClassError"),
								`${error?.error?.message}!`,
								"warning"
							);
						}
					});
			}
		});
	}

	showClassListDisplay(classDetails: any) {
		this.classDetails = classDetails;
		this.showClassListUI = true;
	}

	hideClassListDisplay() {
		this.classDetails = null;
		this.showClassListUI = false;
	}
}
