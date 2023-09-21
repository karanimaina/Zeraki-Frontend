import { Component, EventEmitter, Input, Output } from "@angular/core";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { HotToastService } from "@ngneat/hot-toast";
import { Router } from "@angular/router";
import { Role } from "../../../../../models/Role";
import { UserInfo } from "../../../../../models/user-info";
import { Teacher } from "../../../../../models/teacher/teacher";
import { StaffType } from "../../../../../enums/staff/staff-type";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";

@Component({
	selector: "app-list-teachers",
	templateUrl: "./list-teachers.component.html",
	styleUrls: ["./list-teachers.component.scss"]
})
export class ListTeachersComponent {
	@Input() staffType!: StaffType;
	@Input() loadingError!: boolean;
	@Input() teachers: Teacher[] = [];
	@Input() userRoles!: Role;
	@Input() userInfo!: UserInfo;
	@Input() loading = false;

	@Output() showProfile: EventEmitter<Teacher> = new EventEmitter<Teacher>();

	staffTypes = StaffType;
	updatingRights: { [key: number]: boolean } = {};

	constructor(
		private translateService: TranslateService,
		private teacherService: TeacherService,
		private toastService: HotToastService,
		private router: Router) { }

	viewProfile(teacher: Teacher) {
		this.showProfile.emit(teacher);
	}

	addAdmin(teacher: Teacher) {
		Swal.fire({
			title: this.translateService.instant("teachers.manageTeachers.teacherListItem.makeAdminModal.title"),
			text: this.translateService.instant("teachers.manageTeachers.teacherListItem.makeAdminModal.text", { name: teacher.name }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItem.makeAdminModal.cancelButtonText"),
			confirmButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItem.makeAdminModal.confirmButtonText"),
			focusCancel: true
		}).then((result) => {
			if (result.isConfirmed) {
				this.addOrRevokeAdminRights(teacher, true);
			}
		});
	}

	removeAdmin(teacher: Teacher) {
		Swal.fire({
			title: this.translateService.instant("teachers.manageTeachers.teacherListItem.revokeAdminModal.title"),
			text: this.translateService.instant("teachers.manageTeachers.teacherListItem.revokeAdminModal.text", { name: teacher.name }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItem.revokeAdminModal.cancelButtonText"),
			confirmButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItem.revokeAdminModal.confirmButtonText"),
		}).then((result) => {
			if (result.isConfirmed) {
				this.addOrRevokeAdminRights(teacher, false);
			}
		});
	}

	private addOrRevokeAdminRights(teacher: Teacher, isAdmin: boolean) {
		this.updatingRights[teacher.userid] = true;

		this.teacherService.setAdmin(teacher.userid, isAdmin).subscribe(() => {
			this.updatingRights[teacher.userid] = false;
			teacher.admin = isAdmin;

			this.showSuccessMessage(isAdmin, teacher.name);
		}, () => {
			this.updatingRights[teacher.userid] = false;
			this.showErrorMessage(isAdmin);
		});
	}

	private showSuccessMessage(isAdmin, teacherName) {
		let message;
		if (isAdmin) {
			message = this.translateService.instant("teachers.manageTeachers.toastMessages.addAdminRightSuccess", { teacherName: teacherName });
		} else {
			message = this.translateService.instant("teachers.manageTeachers.toastMessages.revokeAdminRightSuccess");
		}

		this.toastService.success(message);
	}

	private showErrorMessage(isAdmin) {
		let message;
		if (isAdmin) {
			message = this.translateService.instant("teachers.manageTeachers.toastMessages.addAdminRightError");
		} else {
			message = this.translateService.instant("teachers.manageTeachers.toastMessages.revokeAdminRightError");
		}

		this.toastService.error(message);
	}

	goToTeacherClasses(userId) {
		this.router.navigate(["/main/teachers/teacher", userId]);
	}

	adminRightsCanBeRevoked = (teacher: Teacher): boolean => (teacher.admin && !teacher.superAdmin)
		&& (!teacher?.isPrincipal && !teacher?.isDeputyPrincipal)
		&& this.userRoles?.isSchoolAdmin
		&& (this.userInfo.userid != teacher.userid)
		&& this.staffType == this.staffTypes.TEACHERS;

	get isAdmin(): boolean {
		return (this.userRoles.isSchoolAdmin || this.userRoles.isSuperAdmin);
	}
}
