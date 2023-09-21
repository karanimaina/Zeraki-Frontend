import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-staff-nav-top",
	templateUrl: "./staff-nav-top.component.html",
	styleUrls: ["./staff-nav-top.component.scss"]
})
export class StaffNavTopComponent implements OnInit {
	userRoles!: Role;
	constructor(
    private rolesService: RolesService,
    private translateService: TranslateService,
	) {
		this.rolesService.roleSubject.subscribe(role => {
			this.userRoles = role;
		});
	}

	ngOnInit(): void {
	}

	get isFrench(): boolean {
		return this.translateService.currentLang.includes("fr");
	}

}
