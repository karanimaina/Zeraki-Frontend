import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-teacher-top-nav",
	templateUrl: "./teacher-top-nav.component.html",
	styleUrls: ["./teacher-top-nav.component.scss"]
})
export class TeacherTopNavComponent implements OnInit {

	userRoles!: Role;

	constructor(
    private rolesService: RolesService,
    private translateService: TranslateService,
	) {
		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});
	}

	ngOnInit(): void {
	}

	get isFrench(): boolean {
		return this.translateService.currentLang.includes("fr");
	}
}
