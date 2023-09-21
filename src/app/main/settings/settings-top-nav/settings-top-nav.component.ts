import { Component, OnInit } from "@angular/core";
import {DataService} from "../../../@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../@core/models/school-type-data";
import {Role} from "../../../@core/models/Role";
import {RolesService} from "../../../@core/shared/services/role/roles.service";

@Component({
	selector: "app-settings-top-nav",
	templateUrl: "./settings-top-nav.component.html",
	styleUrls: ["./settings-top-nav.component.scss"]
})
export class SettingsTopNavComponent implements OnInit {
	schoolTypeData!: SchoolTypeData;
	roles!: Role;

	constructor(
		private dataService: DataService,
		private rolesService: RolesService) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.getRoles();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	private getRoles() {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.roles = roles;
		});
	}

	get showCompulsorySubjectsNavItem() {
		return this.roles?.isSchoolAdmin && this.schoolTypeData?.includeCompulsorySubjects;
	}

}
