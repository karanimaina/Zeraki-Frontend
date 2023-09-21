import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "app-bom-top-nav",
	templateUrl: "./bom-top-nav.component.html",
	styleUrls: ["./bom-top-nav.component.scss"]
})
export class BomTopNavComponent implements OnInit {
	userRoles!: Role;

	constructor(
    private rolesService: RolesService,
    private translateService: TranslateService,
	) {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});
	}

	ngOnInit(): void {
	}

	get isFrench(): boolean {
		return this.translateService.currentLang.includes("fr");
	}

}
