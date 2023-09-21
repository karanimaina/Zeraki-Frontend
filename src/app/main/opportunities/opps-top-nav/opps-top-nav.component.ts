import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";

@Component({
	selector: "app-opps-top-nav",
	templateUrl: "./opps-top-nav.component.html",
	styleUrls: ["./opps-top-nav.component.scss"]
})
export class OppsTopNavComponent implements OnInit {

	userRoles!: Role;
	constructor(private rolesService: RolesService) {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});
	}

	ngOnInit(): void {}
}
