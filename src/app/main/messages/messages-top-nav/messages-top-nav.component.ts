import { Component, OnInit } from "@angular/core";
import {RolesService} from "../../../@core/shared/services/role/roles.service";
import {Role} from "../../../@core/models/Role";

@Component({
	selector: "app-messages-top-nav",
	templateUrl: "./messages-top-nav.component.html",
	styleUrls: ["./messages-top-nav.component.scss"]
})
export class MessagesTopNavComponent implements OnInit {
	userRoles!: Role;

	constructor(private rolesService: RolesService) {
		this.rolesService.roleSubject.subscribe((roles) => {
			this.userRoles = roles;
		});
	}

	ngOnInit(): void {
	}
}
