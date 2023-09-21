import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { UserInfo } from "src/app/@core/models/user-info";
import { of, Subject } from "rxjs";
import { catchError, take, takeUntil } from "rxjs/operators";
import { Teacher } from "../../../../models/teacher/teacher";
import { TeacherGroup } from "../../../../models/teacher/teacher-group";
import { RolesService } from "../../../services/role/roles.service";
import { Role } from "src/app/@core/models/Role";
import { StaffType } from "../../../../enums/staff/staff-type";
import { StaffGroup } from "../../../../enums/staff/staff-group";
import { TranslateService } from "@ngx-translate/core";
import { SchoolService } from "../../../services/school/school.service";
import { UserService } from "../../../services/user/user.service";
import { StaffService } from "src/app/@core/services/staff/staff.service";
import { ResponseHandlerService } from "../../../services/response-handler/response-handler.service";
import {DataService} from "../../../services/data/data.service";
import {SchoolTypeData} from "../../../../models/school-type-data";

@Component({
	selector: "app-manage-staff-ui",
	templateUrl: "./manage-staff.component.html",
	styleUrls: ["./manage-staff.component.scss"]
})
export class ManageStaffComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	@Input() staff!: StaffType;
	@Input() staffGroup!: StaffGroup;
	@Input() optionalColumns: string[] = [];

	staffList: Teacher[] = [];
	filteredStaffList: Teacher[] = [];
	staffGroups!: TeacherGroup[];
	staffGroupsMap!: { [key: number]: string };
	staffListError = false;
	showProfile = false;
	gender = "";
	userRoles!: Role;

	selectedStaff: any;

	viewPrintFormat = false;
	showGroups = false;
	showPhoneNumbers = true;
	showUsernames!: boolean;
	showNationalIds = true;
	showGender!: boolean;
	showTscNumber!: boolean;
	schoolProfile: any = { logo: "" };
	loggedInUser: UserInfo = new UserInfo();
	searchText = "";

	loading = false;
	schoolData!: SchoolTypeData;

	constructor(
		private staffService: StaffService,
		private userService: UserService,
		private rolesService: RolesService,
		private translate: TranslateService,
		private schoolService: SchoolService,
		private dataService:DataService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.loadSchoolTypeData();
		this.getSchoolProfile();
		this.getUserRoles();
		this.loadStaffList();
		this.loadStaffGroups();
		this.getUserInfo();
		this.setOptionalColumns();
	}

	getUserRoles(): void {
		this.rolesService.roleSubject.subscribe(
			userRoles => {
				this.userRoles = userRoles;
			}
		);
	}

	getUserInfo() {
		this.userService.userInfoSubject.subscribe((userInfo) => {
			this.loggedInUser = userInfo;
		});
	}

	loadStaffList() {
		this.loading = true;
		this.staffService
			.getStaffs(this.staff)
			.pipe(
				take(1),
				catchError(() => {
					this.loading = false;
					this.staffListError = true;
					return of([]);
				}),
				takeUntil(this.destroy$),
			).subscribe({
				next: (teachers) => {
					this.loading = false;
					this.staffList = teachers ?? [];
					this.filteredStaffList = teachers ?? [];
				},
				error: (err) => {
					this.loading = false;
					this.responseHandler.error(err, "loadStaffList");
				},
			});
	}

	loadStaffGroups() {
		this.staffService.getStaffGroups(this.staffGroup).pipe(takeUntil(this.destroy$)).subscribe(
			(staffGroups) => {
				this.staffGroups = staffGroups;

				const groupsMap: { [key: number]: string } = {};
				for (const group of staffGroups) {
					groupsMap[group.staffgroupid] = group.name;
				}
				this.staffGroupsMap = groupsMap;
			}
		);
	}

	setOptionalColumns() {
		if (this.optionalColumns.includes("gender"))
			this.showGender = true;
		if (this.optionalColumns.includes("tscNumber"))
			this.showTscNumber = true;
		if (this.optionalColumns.includes("username"))
			this.showUsernames = true;
	}

	loadSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolData = schoolData;
		});
	}
	get staffName() {
		switch (this.staff) {
		case StaffType.OFFICIALS:
			return this.officialLabel;
		case StaffType.TEACHERS:
			return this.translate.instant("teachers.manageTeachers.title");
		case StaffType.WORKERS:
			return this.translate.instant("staff.manageStaff.title");
		}
	}

	get officialLabel() {
		if (this.schoolData?.isIvorianSchool) {
			return this.translate.instant("common.bomPaShortIvory");
		}

		if (this.schoolData?.isOLevelSchool) {
			return this.translate.instant("bom.manageBom.titleBog");
		}

		return this.translate.instant("bom.manageBom.title");
	}

	togglePrintFormat() {
		this.viewPrintFormat = !this.viewPrintFormat;
	}

	applyFilter(event) {
		this.searchText = event.target.value;

		this.filteredStaffList = this.staffList.filter(teacher =>
			teacher.name.toLowerCase().includes(this.searchText) ||
			teacher.email.toLowerCase().includes(this.searchText) ||
			teacher.phone?.toString().toLowerCase().includes(this.searchText)
		);
	}

	exportTeacherListAsExcel() {
		const options: any = {
			name: 7,
			email: 8,
			showGroups: this.showGroups,
			showNationalIds: this.showNationalIds,
			showPhoneNumbers: this.showPhoneNumbers,
			showUsernames: this.showUsernames,
			showGender: this.showGender,
			showTscNumber: this.showTscNumber
		};

		for (const teacher of this.staffList) {
			options.name = (teacher.name.length > options.name) ? options.name = teacher.name.length : options.name;
			options.email = (teacher.email.length > options.email) ? options.email = teacher.email.length : options.email;

			let groupNames: any[] = [];
			for (const group of teacher.groups) {
				groupNames.push(this.staffGroupsMap[group]);
			}

			teacher["groupNames"] = groupNames.toString();
			groupNames = [];

		}

		this.staffService.staffToExcel(this.staffList, options, this.staffName);
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe(resp => {
			if(resp) this.schoolProfile = resp;
		});
	}

	updateShowProfile() {
		this.showProfile = !this.showProfile;
	}

	showUserTeacherProfile(teacher: Teacher) {
		this.selectedStaff = teacher;
		this.showProfile = true;
	}

	removeDeletedTeacher(teacher: Teacher) {
		this.staffList = this.staffList.filter(t => t.userid != teacher.userid);
		this.filteredStaffList = this.filteredStaffList.filter(t => t.userid != teacher.userid);
	}

	updateTeacherDetails($event: { teacher: Teacher; updatedData: any }) {
		const updatedData = $event.updatedData;

		this.staffList.filter(t => {
			if (t.userid == $event.teacher.userid) {
				t.name = updatedData.name;
				t.phone = updatedData.phone;
				t.personalEmail = updatedData.personalEmail;
				t.email = $event.teacher.email;
				t.gender = updatedData.gender;
				t.tscNo = updatedData.tscNo;
				t.nationalIdNo = updatedData.nationalIdNo;
				t.biography = updatedData.biography;
				t.groups = updatedData.groups;
				t.title = updatedData.title;
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
