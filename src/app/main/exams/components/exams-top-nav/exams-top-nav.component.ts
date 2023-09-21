import {Component, OnInit} from "@angular/core";
import {RolesService} from "../../../../@core/shared/services/role/roles.service";
import {Role} from "../../../../@core/models/Role";
import {SchoolTypeData} from "../../../../@core/models/school-type-data";
import {DataService} from "../../../../@core/shared/services/data/data.service";

@Component({
	selector: "app-exams-top-nav",
	templateUrl: "./exams-top-nav.component.html",
	styleUrls: ["./exams-top-nav.component.scss"]
})
export class ExamsTopNavComponent implements OnInit {

	userRoles!: Role;
	schoolTypeData!: SchoolTypeData;

	constructor(
		private rolesService: RolesService,
		public dataService: DataService
	) {	}

	ngOnInit(): void {
		this.loadUserRole();
		this.loadSchoolRole();
	}

	loadUserRole() {
		this.rolesService.roleSubject.subscribe((role: Role) => {
			this.userRoles = role;
		});
	}

	get isIvorianSchool() {
		return this.schoolTypeData?.isIvorianSchool;
	}

	get isGuineaSchool() {
		return this.schoolTypeData?.isGuineaSchool;
	}

	loadSchoolRole() {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolTypeData = schoolData;
		});
	}

	get showSubjectPaperRatios() {
		return !this.schoolTypeData?.isGuineaSchool &&
			!this.schoolTypeData?.isKcpePrimarySchool &&
			!this.schoolTypeData?.isIvorianSchool;
	}

	get showGradingSystem() {
		return (
			!this.schoolTypeData?.isGuineaSchool
			&& !this.schoolTypeData?.isIvorianSchool
			&& !this.schoolTypeData?.isSouthAfricaPrimarySchool
			&& !this.schoolTypeData?.isSouthAfricaSecondarySchool
		);
	}

	get showMentions() {
		return (
			this.schoolTypeData?.isGuineaSchool
			|| this.schoolTypeData?.isIvorianSchool
			|| this.schoolTypeData?.isSouthAfricaPrimarySchool
			|| this.schoolTypeData?.isSouthAfricaSecondarySchool
		);
	}

	get showCoefficientSystem() {
		return this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
	}
}
