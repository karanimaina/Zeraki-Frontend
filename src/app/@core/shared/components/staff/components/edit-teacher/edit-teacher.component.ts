import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { HotToastService } from "@ngneat/hot-toast";
import { UserInfo } from "../../../../../models/user-info";
import { phoneNumberValidator } from "../../../../directives/phone-validator.directive";
import { Teacher } from "../../../../../models/teacher/teacher";
import { TeacherGroup } from "../../../../../models/teacher/teacher-group";
import { emptyStringValidator } from "../../../../directives/empty-string-validator.directive";
import { StaffType } from "../../../../../enums/staff/staff-type";
import { StaffService } from "src/app/@core/services/staff/staff.service";
import { SchoolTypeCheckerService } from "src/app/@core/shared/services/school/school-type-checker/school-type-checker.service";
import { Role } from "src/app/@core/models/Role";
import { Subject } from "rxjs";
import { TeacherService } from "src/app/@core/services/teacher/teacher.service";
import { finalize, takeUntil } from "rxjs/operators";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-edit-teacher",
	templateUrl: "./edit-teacher.component.html",
	styleUrls: ["./edit-teacher.component.scss"]
})
export class EditTeacherComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	@Input() staffType!: StaffType;
	@Input() staff!: Teacher;
	@Input() userInfo!: UserInfo;
	@Input() teacherGroups!: TeacherGroup[];
	@Input() userRoles?: Role;

	@Output() closeProfileView: EventEmitter<void> = new EventEmitter<void>();
	@Output() staffDeleted: EventEmitter<Teacher> = new EventEmitter<Teacher>();
	@Output() teacherUpdated: EventEmitter<{ teacher: Teacher, updatedData: any }> = new EventEmitter<{ teacher: Teacher, updatedData: any }>();

	genderTypes: Array<{ name: string, value: string }> = [];
	staffTypes = StaffType;
	editStaffForm!: FormGroup;

	submitted = false;
	isUpdatingStaff = false;
	isDeletingStaff = false;

	schoolTypeData?: SchoolTypeData;

	constructor(
		private translateService: TranslateService,
		private staffService: StaffService,
		private teacherService: TeacherService,
		private dataService: DataService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		public schoolTypeChecker: SchoolTypeCheckerService,
		private fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.initForm();
		this.setGenderTypes();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	initForm() {
		this.editStaffForm = this.fb.group({
			name: [this.staff.name, [Validators.required, emptyStringValidator]],
			personalEmail: [this.staff.personalEmail, [Validators.email]],
			phone: [this.staff.phone, [phoneNumberValidator]],
			gender: [this.staff.gender?.toLowerCase()],
			tscNo: [this.staff.tscNo],
			nationalIdNo: [this.staff.nationalIdNo],
			biography: [{ value: this.staff.biography, disabled: (this.staff.userid != this.userInfo?.userid) }],
			address: [this.staff.address],
			groups: [this.staff.groups],
			title: [this.staff.title],
		});
	}

	setGenderTypes() {
		this.genderTypes = [
			{
				name: this.translateService.instant("teachers.manageTeachers.teacherListItemUpdate.form.genderMaleOption"),
				value: "male"
			},
			{
				name: this.translateService.instant("teachers.manageTeachers.teacherListItemUpdate.form.genderFemaleOption"),
				value: "female"
			},
			{
				name: this.translateService.instant("teachers.manageTeachers.teacherListItemUpdate.form.genderUnspecifiedOption"),
				value: "unspecified"
			},
		];
	}

	get canDeleteStaff(): boolean {
		return (
			(this.userInfo?.userid != this.staff?.userid)
			&&
			(this.staff?.role !== 50)
			&&
			this.canDeleteAdminStaff
		);
	}

	get canDeleteAdminStaff(): boolean {
		return (this.schoolTypeData?.hasSuperAdmins && !this.userRoles?.isSuperAdmin) ? false : true;
	}

	get isPrincipalDeputyOrDos(): boolean {
		return this.userRoles?.isPrincipal || this.userRoles?.isDeputyPrincipal || this.userRoles?.isDos || false;
	}

	qualifiesForSuperAdminRole = (): boolean => (!this.staff.superAdmin && !this.staff.isPrincipal && this.staff?.role != 50);


	superAdminRightsCanBeRevoked = (): boolean => (!this.staff.isPrincipal && !this.staff.isDeputyPrincipal && !this.staff.isDos);

	get isTeacher() {
		return this.staffType == this.staffTypes.TEACHERS;
	}

	get isBom() {
		return this.staffType == this.staffTypes.OFFICIALS;
	}

	get staffTypeUrl() {
		switch (this.staffType) {
		case this.staffTypes.TEACHERS:
			return "teacher";
		case this.staffTypes.WORKERS:
			return "worker";
		case this.staffTypes.OFFICIALS:
			return "official";
		}
	}

	get f(): { [key: string]: AbstractControl } {
		return this.editStaffForm.controls;
	}

	updateTeacher() {
		this.submitted = true;
		if (this.editStaffForm.invalid) {
			this.toastService.error(this.translateService.instant("settings.userProfile.toastMessages.invalidForm"));
			return;
		}

		this.isUpdatingStaff = true;

		this.staffService.updateStaff(this.staff.userid, this.staffTypeUrl, this.editStaffForm.value)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.isUpdatingStaff = false))
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp, "updateTeacher()");

					this.teacherUpdated.emit({ teacher: this.staff, updatedData: this.editStaffForm.value });
					this.closeProfileViewComponent();
				},
				error: (error: any) => {
					this.responseHandler.error(error, "updateTeacher()");
				}
			});
	}

	deleteTeacherConfirm() {
		Swal.fire({
			title: this.translateService.instant("staff.manageStaff.swal.title"),
			text: this.translateService.instant("staff.manageStaff.swal.text", { name: this.staff.name }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItemUpdate.profileDeleteConfirmationModal.cancelButtonText"),
			confirmButtonText: this.translateService.instant("teachers.manageTeachers.teacherListItemUpdate.profileDeleteConfirmationModal.confirmButtonText"),
			focusCancel: true
		}).then((result) => {
			if (result.isConfirmed) {
				this.deleteTeacher();
			}
		});
	}

	private deleteTeacher() {
		this.isDeletingStaff = true;
		this.staffService.deleteStaff(this.staff.userid).subscribe(() => {
			this.isDeletingStaff = false;
			const message = this.translateService.instant("staff.manageStaff.toastMessages.deleteStaffSuccess");
			this.toastService.success(message);

			this.staffDeleted.emit(this.staff);
			this.closeProfileViewComponent();
		}, () => {
			this.isDeletingStaff = false;
		});
	}

	closeProfileViewComponent() {
		this.closeProfileView.emit();
	}

	async handleSuperAdmin(makeSuperAdmin: boolean) {
		const result = await Swal.fire({
			title: this.translateService.instant(`teachers.manageTeachers.teacherListItemUpdate.profile${makeSuperAdmin ? "Make" : "Revoke"}SuperAdminConfirmationModal.title`),
			text: this.translateService.instant(`teachers.manageTeachers.teacherListItemUpdate.profile${makeSuperAdmin ? "Make" : "Revoke"}SuperAdminConfirmationModal.text`, { name: this.staff.name }),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translateService.instant("common.swal.cancelButtonTextCancel"),
			confirmButtonText: this.translateService.instant("common.swal.confirmButtonTextOkay"),
			focusCancel: true
		});

		if (result.isConfirmed) this.updateStaffSuperAdminRights(this.staff.userid, makeSuperAdmin);
	}

	isUpdatingSuperAdminRights = false;

	private updateStaffSuperAdminRights(userId: number, makeSuperAdmin: boolean) {
		this.isUpdatingSuperAdminRights = true;

		this.teacherService.setSuperAdmin(userId, makeSuperAdmin)
			.pipe(finalize(() => this.isUpdatingSuperAdminRights = false), takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp, "updateStaffSuperAdminRights()");
					this.staff.superAdmin = makeSuperAdmin;
					this.closeProfileViewComponent();
				},
				error: (err) => this.responseHandler.error(err, "updateStaffSuperAdminRights()"),
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
