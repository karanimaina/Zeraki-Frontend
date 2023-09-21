import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { SchoolInfo } from "../../@core/models/school-info";
import { RolesService } from "../../@core/shared/services/role/roles.service";
import { Role } from "../../@core/models/Role";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { LocalUser } from "../../@core/models/user";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-side-nav",
	templateUrl: "./side-nav.component.html",
	styleUrls: ["./side-nav.component.scss"]
})
export class SideNavComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	@Input() networkStatus?: boolean | null;

	schoolInfo!: SchoolInfo;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	schoolTypeData!: SchoolTypeData;

	loggedInUser!: LocalUser;

	constructor(
		private schoolService: SchoolService,
		private rolesService: RolesService,
		private authService: AuthService,
		private dataService: DataService) {
		this.loggedInUser = this.authService.loggedInUser;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.getSchoolInfo();
	}

	getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;

		});
	}

	getSchoolInfo() {
		this.schoolService.schoolInfo.pipe(takeUntil(this.destroy$)).subscribe((schoolInfo: SchoolInfo) => {
			this.schoolInfo = schoolInfo;
		});

	}

	get showProducts() {
		return this.schoolTypeData &&
			!this.schoolTypeData.isOLevelSchool &&
			!this.schoolTypeData.isGuineaSchool &&
			!this.schoolTypeData.isIvorianSchool;
	}

}
